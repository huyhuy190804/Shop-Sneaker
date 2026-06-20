import User from "../models/userModel.js";
import Product from "../models/productModel.js";

const wishlistProductSelect = "name slug productImages basePrice salePrice averageRating numReviews status";

const populateWishlistUser = async (userId) =>
  User.findById(userId).select("-password").populate("wishlist", wishlistProductSelect);

const buildWishlistResponse = (user) => ({
  wishlist: user?.wishlist || [],
  count: user?.wishlist?.length || 0,
  user,
});

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Protected
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    const user = await populateWishlistUser(userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's wishlist
// @route   GET /api/users/wishlist
// @access  Protected
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User ID is missing" });
    }

    const user = await populateWishlistUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(buildWishlistResponse(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Protected
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;
    const productId = req.body?.productId;

    if (!userId) {
      return res.status(401).json({ message: "User ID is missing" });
    }

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const exists = user.wishlist.some((item) => String(item) === String(productId));
    if (!exists) {
      user.wishlist.push(productId);
      await user.save();
    }

    const refreshedUser = await populateWishlistUser(userId);

    return res.status(200).json({
      message: exists ? "Product already in wishlist" : "Added to wishlist",
      ...buildWishlistResponse(refreshedUser),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Protected
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "User ID is missing" });
    }

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.wishlist = user.wishlist.filter((item) => String(item) !== String(productId));
    await user.save();

    const refreshedUser = await populateWishlistUser(userId);

    return res.status(200).json({
      message: "Removed from wishlist",
      ...buildWishlistResponse(refreshedUser),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Protected
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    const user = await User.findById(userId);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      if (req.body.shippingAddresses) {
        user.shippingAddresses = req.body.shippingAddresses;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        shippingAddresses: updatedUser.shippingAddresses,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all users (paginated)
// @route   GET /api/users
// @access  Admin
export const getUsers = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const count = await User.countDocuments({});
    const users = await User.find({})
      .select("-password")
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      users,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id
// @access  Admin
export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = req.body.role || user.role;
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: "User removed" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
