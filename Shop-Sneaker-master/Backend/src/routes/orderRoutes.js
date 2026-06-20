import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  confirmPayment,
  sendPaymentEmail,
  sendShippingEmail,
  sendThankYouEmailHandler,
} from "../controllers/orderController.js";
import {
  authenticateUser,
  authorizeAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// User routes
router.post("/", authenticateUser, createOrder);
router.get("/", authenticateUser, getMyOrders);

// Payment and email routes
router.post("/:id/confirm-payment", authenticateUser, confirmPayment);
router.post("/:id/send-payment-email", authenticateUser, sendPaymentEmail);
router.post(
  "/:id/send-shipping-email",
  authenticateUser,
  authorizeAdmin,
  sendShippingEmail,
);
router.post(
  "/:id/send-thank-you-email",
  authenticateUser,
  sendThankYouEmailHandler,
);

// Admin routes
router.get("/admin/all", authenticateUser, authorizeAdmin, getAllOrders);
router.put(
  "/admin/:id/status",
  authenticateUser,
  authorizeAdmin,
  updateOrderStatus,
);

router.get("/:id", authenticateUser, getOrderById);

export default router;
