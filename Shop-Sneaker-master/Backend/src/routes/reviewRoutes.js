import express from "express";
import auth from "../middleware/authMiddleware.js";
import {
  createReview,
  deleteReview,
  getReviewsForProduct,
  updateReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/:productId", getReviewsForProduct);
router.post("/:productId", auth, createReview);
router.put("/:id", auth, updateReview);
router.delete("/:id", auth, deleteReview);

export default router;
