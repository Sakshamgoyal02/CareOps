import express from "express";
import { requireAuth, requireOwner } from "../middleware/auth.js";
import {
  createServiceType,
  getServiceTypes,
  updateServiceType,
  deleteServiceType,
} from "../controllers/serviceTypeController.js";

const router = express.Router();

router.use(requireAuth, requireOwner);

router.post("/", createServiceType);
router.get("/", getServiceTypes);
router.patch("/:id", updateServiceType);
router.delete("/:id", deleteServiceType);

export default router;
