import express from "express";
import { requireAuth, requireOwner } from "../middleware/auth.js";
import { getDashboardSummary } from "../controllers/dashboardController.js";

const router = express.Router();

router.use(requireAuth, requireOwner);

router.get("/", getDashboardSummary);

export default router;
