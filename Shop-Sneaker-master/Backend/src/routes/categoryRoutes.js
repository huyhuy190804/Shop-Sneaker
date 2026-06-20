import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// GET all categories
router.get("/", getAllCategories);

// GET category by ID
router.get("/:id", getCategoryById);

// CREATE new category
router.post("/", createCategory);

// UPDATE category
router.put("/:id", updateCategory);

// DELETE category
router.delete("/:id", deleteCategory);

export default router;
