import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from "../controllers/productController.js";
import {
  authenticateUser,
  authorizeAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getProducts)
  .post(authenticateUser, authorizeAdmin, createProduct);
router
  .route("/:id")
  .get(getProductById)
  .put(authenticateUser, authorizeAdmin, updateProduct)
  .delete(authenticateUser, authorizeAdmin, deleteProduct);

// ── Variant routes (Admin only) ─────────────────
router.post("/:productId/variants", authenticateUser, authorizeAdmin, createVariant);
router.put("/:productId/variants/:variantId", authenticateUser, authorizeAdmin, updateVariant);
router.delete("/:productId/variants/:variantId", authenticateUser, authorizeAdmin, deleteVariant);

export default router;
