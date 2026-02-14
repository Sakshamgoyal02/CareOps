import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getAlerts, resolveAlert } from "../controllers/alertController.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getAlerts);
router.patch("/:id/resolve", resolveAlert);

export default router;
