import express from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
} from "../controllers/inventoryController.js";

const router = express.Router();

router.use(requireAuth, requirePermission("inventory"));

router.post("/", createInventoryItem);
router.get("/", getInventoryItems);
router.patch("/:id", updateInventoryItem);
router.delete("/:id", deleteInventoryItem);

export default router;
