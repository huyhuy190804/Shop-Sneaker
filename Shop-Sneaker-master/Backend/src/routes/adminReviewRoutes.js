import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import {
  getAllReviewsAdmin,
  updateReviewStatus,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", authenticateAdmin, getAllReviewsAdmin);
router.put("/:id/status", authenticateAdmin, updateReviewStatus);

export default router;
