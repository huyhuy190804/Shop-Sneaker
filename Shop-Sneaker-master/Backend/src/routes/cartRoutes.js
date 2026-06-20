import express from "express";
import cartController from "../controllers/cartController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", auth, cartController.getCart);
router.post("/add", auth, cartController.addToCart);
router.put("/update", auth, cartController.updateCartItemQuantity);
router.delete("/remove/:productId/:variantId", auth, cartController.removeCartItem);
router.delete("/clear", auth, cartController.clearCart);
router.post("/apply-coupon", auth, cartController.applyCouponToCart);

export default router;
