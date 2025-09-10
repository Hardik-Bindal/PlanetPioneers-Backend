import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * ✅ Protect Middleware
 * Ensures the user is authenticated via JWT
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "❌ Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (without password) to request
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "❌ User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ JWT Error:", error.message);
    return res.status(401).json({ message: "❌ Not authorized, invalid/expired token" });
  }
};

/**
 * ✅ Role-based Middlewares
 */
export const teacherOnly = (req, res, next) => {
  if (req.user?.role === "teacher") return next();
  return res.status(403).json({ message: "🚫 Access denied: Teachers only" });
};

export const studentOnly = (req, res, next) => {
  if (req.user?.role === "student") return next();
  return res.status(403).json({ message: "🚫 Access denied: Students only" });
};

/**
 * ✅ Flexible Role Checker
 * Usage: roleCheck("teacher", "admin")
 */
export const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (req.user && allowedRoles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: "🚫 Access denied: Insufficient permissions" });
  };
};
