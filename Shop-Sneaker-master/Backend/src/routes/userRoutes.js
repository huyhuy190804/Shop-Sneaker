import express from "express";
import {
  getUserProfile,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import { authenticateUser, authenticateAdmin, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// User Profile Management
router
  .route("/profile")
  .get(authenticateUser, getUserProfile)
  .put(authenticateUser, updateUserProfile);

router
  .route("/wishlist")
  .get(authenticateUser, getWishlist)
  .post(authenticateUser, addToWishlist);

router
  .route("/wishlist/:productId")
  .delete(authenticateUser, removeFromWishlist);

// Admin User Management
router
  .route("/")
  .get(authenticateAdmin, authorizeAdmin, getUsers);

router
  .route("/:id")
  .get(authenticateAdmin, authorizeAdmin, getUserById)
  .put(authenticateAdmin, authorizeAdmin, updateUserRole)
  .delete(authenticateAdmin, authorizeAdmin, deleteUser);

export default router;
