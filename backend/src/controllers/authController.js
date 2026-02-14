import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";

const signToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      workspaceId: user.workspaceId,
      role: user.role,
      permissions: user.permissions,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const registerOwner = async (req, res) => {
  try {
    const { name, email, password, workspaceName, address, timezone, contactEmail } = req.body;

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in .env");
      return res.status(500).json({ message: "Server configuration error: JWT_SECRET missing" });
    }

    if (!name || !email || !password || !workspaceName || !address || !timezone || !contactEmail) {
      return res.status(400).json({
        message: "Missing required fields: name, email, password, workspaceName, address, timezone, contactEmail",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const workspace = await Workspace.create({
      name: workspaceName,
      address,
      timezone,
      contactEmail,
      emailConnected: false,
      isActive: false,
    });

    const hashed = await bcrypt.hash(password, 10);

    const owner = await User.create({
      name,
      email,
      workspaceId: workspace._id,
      password: hashed,
      role: "owner",
      permissions: {
        inbox: true,
        bookings: true,
        forms: true,
        inventory: true,
      },
    });

    const token = signToken(owner);

    res.status(201).json({
      token,
      user: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        workspaceId: owner.workspaceId,
        role: owner.role,
        permissions: owner.permissions,
      },
    });
  } catch (err) {
    console.error("registerOwner error:", err);
    const msg =
      process.env.NODE_ENV === "production"
        ? "Failed to register owner"
        : (err.message || "Failed to register owner");
    res.status(500).json({ message: msg });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("workspaceId");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        workspaceId: user.workspaceId,
        role: user.role,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Failed to login" });
  }
};

export { registerOwner, login };
