import bcrypt from "bcryptjs";
import User from "../models/User.js";

const createStaff = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;
    const workspaceId = req.user.workspaceId;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const staff = await User.create({
      name,
      email,
      password: hashed,
      workspaceId,
      role: "staff",
      permissions: permissions || {},
    });

    res.status(201).json(staff);
  } catch (err) {
    console.error("createStaff error:", err);
    res.status(500).json({ message: "Failed to create staff" });
  }
};

const getUsers = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const users = await User.find({ workspaceId }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("getUsers error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspaceId;
    const { name, permissions, isActive } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: id, workspaceId },
      { $set: { name, permissions, isActive } },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("updateUser error:", err);
    res.status(500).json({ message: "Failed to update user" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.user.workspaceId;

    if (req.user.id === id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const deleted = await User.findOneAndDelete({ _id: id, workspaceId });
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("deleteUser error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export { createStaff, getUsers, updateUser, deleteUser };
