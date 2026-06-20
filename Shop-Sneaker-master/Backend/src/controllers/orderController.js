import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import Variant from "../models/variantModel.js";
import User from "../models/userModel.js";
import {
  sendPaymentConfirmationEmail,
  sendOrderConfirmationEmail,
  sendShippingNotificationEmail,
  sendThankYouEmail,
} from "../utils/emailService.js";
import {
  sendAdminTransferNotification,
  sendUserOrderConfirmation,
} from "../utils/mailer.js";

const requiredShippingFields = [
  "email",
  "firstName",
  "lastName",
  "address",
  "city",
  "postalCode",
];

const getMissingShippingFields = (shippingAddress = {}) =>
  requiredShippingFields.filter(
    (field) => !String(shippingAddress[field] || "").trim(),
  );

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Protected
export const createOrder = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { shippingAddress, paymentMethod, shippingMethod } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    const missingShippingFields = getMissingShippingFields(shippingAddress);
    if (missingShippingFields.length > 0) {
      return res.status(400).json({
        message: "Shipping address is incomplete",
        missingFields: missingShippingFields,
      });
    }

    if (!["COD", "BankTransfer"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // 1. Get user cart
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2. Validate stock and prepare order items
    const orderItems = [];
    for (const item of cart.items) {
      const variant = await Variant.findById(item.variantId);

      if (!variant) {
        return res.status(404).json({
          message: `Variant not found for item ${item.productId.name}`,
        });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.productId.name} (${variant.size}, ${variant.color}). Available: ${variant.stock}`,
        });
      }

      orderItems.push({
        productId: item.productId._id,
        variantId: item.variantId,
        name: item.productId.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.productId.productImages?.[0] || "",
      });

      // Decrement stock
      variant.stock -= item.quantity;
      await variant.save();
    }

    // 3. Create order
    const order = new Order({
      userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingMethod,
      totalPrice: cart.totalPrice,
      orderStatus: "Pending",
    });

    const createdOrder = await order.save();
    const populatedOrder = await Order.findById(createdOrder._id).populate(
      "userId",
      "name email",
    );

    if (paymentMethod === 'BankTransfer') {
      try {
        await sendAdminTransferNotification(createdOrder);
      } catch (notificationError) {
        console.error("Failed to send admin transfer notification:", notificationError);
      }
    }

    // 4. Clear cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    const fallbackUser = await User.findById(userId).select("name email");
    const orderForEmail = populatedOrder || createdOrder;
    const customerEmail =
      populatedOrder?.userId?.email || fallbackUser?.email || null;

    await Promise.all([
      sendAdminTransferNotification(orderForEmail),
      sendUserOrderConfirmation(orderForEmail, customerEmail),
    ]);

    res.status(201).json(orderForEmail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Protected
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Protected/Admin
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isAdmin = req.user?.role === "admin";
    const orderOwnerId = order.userId?._id || order.userId;
    const isOwner = String(orderOwnerId) === String(req.user?._id);

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "You are not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Admin
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.orderStatus = status;
    }

    const count = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(limit) * (Number(page) - 1));

    res.json({
      orders,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const { status } = req.body;
    const currentStatus = order.orderStatus;

    // Transition logic for order fulfillment and manual payment review.
    const validTransitions = {
      Pending: ["Shipped", "Cancelled"],
      Shipped: ["Delivered"],
      Delivered: [],
      Cancelled: [],
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${currentStatus} to ${status}`,
      });
    }

    order.orderStatus = status;

    if (status === "Delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    // Return stock if cancelled
    if (status === "Cancelled" && currentStatus !== "Cancelled") {
      for (const item of order.orderItems) {
        const variant = await Variant.findById(item.variantId);
        if (variant) {
          variant.stock += item.quantity;
          await variant.save();
        }
      }
    }

    const updatedOrder = await order.save();

    if (status === 'Shipped') {
      try {
        await updatedOrder.populate("userId", "email");
        await sendUserOrderConfirmation(updatedOrder, updatedOrder.userId?.email);
      } catch (notificationError) {
        console.error("Failed to send user order confirmation:", notificationError);
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm payment and send confirmation email
// @route   POST /api/orders/:id/confirm-payment
// @access  Protected
export const confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized
    const isAdmin = req.user?.role === "admin";
    const orderOwnerId = order.userId?._id || order.userId;
    const isOwner = String(orderOwnerId) === String(req.user?._id);

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "You are not authorized to confirm this payment" });
    }

    // Check if already paid
    if (order.isPaid) {
      return res.status(400).json({ message: "Order already paid" });
    }

    // Update payment status
    order.isPaid = true;
    order.paidAt = new Date();
    order.orderStatus = "Shipped"; // Update status to Shipped after payment

    const paymentResult = req.body.paymentResult || {};
    if (paymentResult.id) {
      order.paymentResult = {
        id: paymentResult.id,
        status: paymentResult.status || "paid",
        update_time: new Date(),
        email_address: paymentResult.email_address || order.userId.email,
      };
    }

    const updatedOrder = await order.save();

    // Send payment confirmation email
    const emailSent = await sendPaymentConfirmationEmail(
      order.userId.email,
      order.userId.name,
      updatedOrder,
    );

    res.json({
      order: updatedOrder,
      emailStatus: emailSent ? "sent" : "failed",
      message: emailSent
        ? "Payment confirmed and notification email sent successfully"
        : "Payment confirmed but email notification failed",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send payment confirmation email
// @route   POST /api/orders/:id/send-payment-email
// @access  Protected/Admin
export const sendPaymentEmail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized
    const isAdmin = req.user?.role === "admin";
    const orderOwnerId = order.userId?._id || order.userId;
    const isOwner = String(orderOwnerId) === String(req.user?._id);

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "You are not authorized to send this email" });
    }

    // Send payment confirmation email
    const emailSent = await sendPaymentConfirmationEmail(
      order.userId.email,
      order.userId.name,
      order,
    );

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.json({ message: "Payment confirmation email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send shipping notification email
// @route   POST /api/orders/:id/send-shipping-email
// @access  Admin
export const sendShippingEmail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is admin
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to send shipping emails" });
    }

    const { trackingNumber } = req.body;

    // Send shipping notification email
    const emailSent = await sendShippingNotificationEmail(
      order.userId.email,
      order.userId.name,
      order,
      trackingNumber,
    );

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.json({ message: "Shipping notification email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send thank you email
// @route   POST /api/orders/:id/send-thank-you-email
// @access  Protected
export const sendThankYouEmailHandler = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user is authorized
    const isAdmin = req.user?.role === "admin";
    const orderOwnerId = order.userId?._id || order.userId;
    const isOwner = String(orderOwnerId) === String(req.user?._id);

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "You are not authorized to send this email" });
    }

    // Send thank you email
    const emailSent = await sendThankYouEmail(
      order.userId.email,
      order.userId.name,
      order,
    );

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send email" });
    }

    res.json({ message: "Thank you email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
