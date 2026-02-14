import express from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  publicCreateContact,
  listContacts,
  getConversation,
  replyToConversation,
} from "../controllers/contactConversationController.js";

const router = express.Router();

router.post("/public", publicCreateContact);

router.use(requireAuth, requirePermission("inbox"));

router.get("/contacts", listContacts);
router.get("/conversations/:contactId", getConversation);
router.post("/conversations/:contactId/reply", replyToConversation);

export default router;
