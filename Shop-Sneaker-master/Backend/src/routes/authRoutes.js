import express from "express";
import { getGoogleConfig, googleLogin, logout, me } from "../controllers/authController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/google-config", getGoogleConfig);
router.post("/google", googleLogin);
router.get("/me", auth, me);
router.post("/logout", auth, logout);

export default router;
