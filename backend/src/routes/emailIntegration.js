import express from "express";
import { requireAuth, requireOwner } from "../middleware/auth.js";
import { saveEmailConfig, testEmailConfig, getEmailStatus, disconnectEmail } from "../controllers/emailIntegrationController.js";

const router = express.Router();

router.use(requireAuth, requireOwner);

router.post("/config", saveEmailConfig);
router.post("/test", testEmailConfig);
router.get("/status", getEmailStatus);
router.post("/disconnect", disconnectEmail);

export default router;
