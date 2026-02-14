import express from "express";
import { requireAuth, requireOwner } from "../middleware/auth.js";
import { createStaff, getUsers, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.use(requireAuth, requireOwner);

router.post("/", createStaff);
router.get("/", getUsers);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
