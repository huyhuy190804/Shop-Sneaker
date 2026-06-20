import User from "../models/userModel.js";
import { createSessionToken } from "../utils/authToken.js";
import { getFirebaseAuth } from "../config/firebase.js";

const verifyFirebaseToken = async (idToken) => {
  const auth = getFirebaseAuth();
  
  if (!auth) {
    throw new Error("Firebase Admin is not initialized. Please check your Firebase configuration.");
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    
    if (!decodedToken.email) {
      throw new Error("Firebase token does not contain an email");
    }

    if (!decodedToken.email_verified) {
      throw new Error("Email is not verified in Firebase");
    }

    return {
      sub: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email.split("@")[0],
      picture: decodedToken.picture || "",
      email_verified: decodedToken.email_verified,
    };
  } catch (error) {
    if (error.code === "auth/id-token-expired") {
      throw new Error("Firebase token has expired");
    }
    if (error.code === "auth/argument-error") {
      throw new Error("Invalid Firebase token format");
    }
    throw new Error(error.message || "Firebase token verification failed");
  }
};

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const plainUser = typeof user.toObject === "function" ? user.toObject() : user;
  const { password, ...safeUser } = plainUser;
  return safeUser;
};

export const googleLogin = async (req, res) => {
  try {
    const idToken = req.body?.credential || req.body?.idToken;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required",
      });
    }

    const firebaseUser = await verifyFirebaseToken(idToken);

    let user = await User.findOne({ email: firebaseUser.email });

    if (!user) {
      user = new User({
        name: firebaseUser.name || firebaseUser.email.split("@")[0],
        email: firebaseUser.email,
        password: "",
        role: "user",
        googleId: firebaseUser.sub,
        avatar: firebaseUser.picture || "",
        authProvider: "google",
      });
    } else {
      user.name = firebaseUser.name || user.name;
      user.googleId = firebaseUser.sub;
      user.avatar = firebaseUser.picture || user.avatar || "";
      user.authProvider = "google";
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = createSessionToken({
      sub: String(user._id),
      role: user.role,
      email: user.email,
      name: user.name,
    });

    return res.status(200).json({
      success: true,
      message: "Firebase login successful",
      accessToken,
      token: accessToken,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Firebase login failed",
    });
  }
};

export const getGoogleConfig = async (req, res) => {
  return res.status(200).json({
    success: true,
    googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "",
  });
};

export const me = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
};

export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
