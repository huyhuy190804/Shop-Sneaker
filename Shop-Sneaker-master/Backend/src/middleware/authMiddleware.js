import User from "../models/userModel.js";
import { verifySessionToken } from "../utils/authToken.js";

const getDevFallbackUser = (role = "user") => ({
  _id: "6634e7e2f1b2c2a1b2c3d4e5",
  role,
});

const resolveToken = (req) => req.headers.authorization?.split(" ")[1];

const attachUserFromToken = async (req, token) => {
  const decoded = verifySessionToken(token);
  const user = await User.findById(decoded.sub).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  req.user = user;
  req.auth = decoded;
};

export const authenticateUser = async (req, res, next) => {
  try {
    const token = resolveToken(req);

    if (!token) {
      if (process.env.NODE_ENV !== "production") {
        req.user = getDevFallbackUser();
        return next();
      }

      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    await attachUserFromToken(req, token);
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

export default authenticateUser;

export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = resolveToken(req);

    if (!token) {
      if (process.env.NODE_ENV !== "production") {
        req.user = getDevFallbackUser("admin");
        return next();
      }

      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    const decoded = verifySessionToken(token);
    const user = await User.findById(decoded.sub).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions. Admin access required",
      });
    }

    req.user = user;
    req.auth = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

export const authorizeAdmin = (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions. Admin access required",
      });
    }

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Authorization failed",
      error: error.message,
    });
  }
};
