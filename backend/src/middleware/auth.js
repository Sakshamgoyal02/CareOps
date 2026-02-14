import jwt from "jsonwebtoken";
import User from "../models/User.js";

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    req.user = {
      id: user._id,
      workspaceId: user.workspaceId,
      role: user.role,
      permissions: user.permissions,
    };

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const requireOwner = (req, res, next) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ message: "Owner role required" });
  }
  next();
};

const requirePermission = (permKey) => {
  return (req, res, next) => {
    if (req.user.role === "owner") return next();
    if (!req.user.permissions?.[permKey]) {
      return res.status(403).json({ message: `Permission '${permKey}' required` });
    }
    next();
  };
};

export { requireAuth, requireOwner, requirePermission };
