import express from "express";
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";

const router = express.Router();

// GET all brands - Public
router.get("/", getAllBrands);

// GET brand by ID - Public
router.get("/:id", getBrandById);

// CREATE new brand - Admin only
// TODO: Add admin authentication middleware before deploying
// Example: router.post('/', authenticateAdmin, createBrand);
router.post("/", createBrand);

// UPDATE brand - Admin only
// TODO: Add admin authentication middleware before deploying
// Example: router.put('/:id', authenticateAdmin, updateBrand);
router.put("/:id", updateBrand);

// DELETE brand - Admin only
// TODO: Add admin authentication middleware before deploying
// Example: router.delete('/:id', authenticateAdmin, deleteBrand);
router.delete("/:id", deleteBrand);

export default router;
