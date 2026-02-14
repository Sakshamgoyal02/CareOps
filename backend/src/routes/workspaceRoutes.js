import express from "express";
import { requireAuth, requireOwner } from "../middleware/auth.js";
import { getMyWorkspace, getIntegrationStatus, updateWorkspace, activateWorkspace } from "../controllers/workspaceController.js";

const router = express.Router();

router.use(requireAuth, requireOwner);

router.get("/me", getMyWorkspace);
router.get("/integration-status", getIntegrationStatus);
router.patch("/me", updateWorkspace);
router.post("/activate", activateWorkspace);

export default router;
