import Contact from "../models/Contact.js";
import Conversation from "../models/Conversation.js";
import { emailService } from "../utils/integrationService.js";

const publicCreateContact = async (req, res) => {
  try {
    const { workspaceId, name, email, phone, optionalMessage } = req.body;

    if (!workspaceId || (!email && !phone)) {
      return res.status(400).json({ message: "workspaceId and email or phone required" });
    }

    const orConditions = [];
    if (email) orConditions.push({ email });
    if (phone) orConditions.push({ phone });

    let contact = await Contact.findOne({
      workspaceId,
      $or: orConditions.length ? orConditions : [{ email: null }, { phone: null }],
    });

    if (!contact) {
      contact = await Contact.create({
        workspaceId,
        name,
        email,
        phone,
        optionalMessage,
        status: "new",
      });
    }

    const welcomeMessage = {
      sender: "system",
      content: "Thanks for reaching out! Our team will get back to you shortly.",
      channel: "email",
      timestamp: new Date(),
    };

    const messages = [];
    if (optionalMessage?.trim()) {
      messages.push({
        sender: "contact",
        content: optionalMessage.trim(),
        channel: "form",
        timestamp: new Date(),
      });
    }
    messages.push(welcomeMessage);

    let conversation = await Conversation.findOne({
      workspaceId,
      contactId: contact._id,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        workspaceId,
        contactId: contact._id,
        messages,
      });
    } else {
      messages.forEach((m) => conversation.messages.push(m));
      await conversation.save();
    }

    if (contact.email) {
      await emailService.sendEmail(
        contact.email,
        "Thanks for contacting us",
        welcomeMessage.content
      );
    }

    res.status(201).json({ contact, conversationId: conversation._id });
  } catch (err) {
    console.error("publicCreateContact error:", err);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Contact already exists for this email/phone/workspace" });
    }
    res.status(500).json({ message: "Failed to create contact" });
  }
};

const listContacts = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const contacts = await Contact.find({ workspaceId }).sort({ updatedAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error("listContacts error:", err);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

const getConversation = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { contactId } = req.params;

    const conversation = await Conversation.findOne({ workspaceId, contactId }).populate(
      "contactId"
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.json(conversation);
  } catch (err) {
    console.error("getConversation error:", err);
    res.status(500).json({ message: "Failed to fetch conversation" });
  }
};

const replyToConversation = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { contactId } = req.params;
    const { content } = req.body;

    const conversation = await Conversation.findOne({ workspaceId, contactId }).populate(
      "contactId"
    );
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const message = {
      sender: "staff",
      content,
      channel: "email",
      timestamp: new Date(),
    };

    conversation.messages.push(message);
    await conversation.save();

    if (conversation.contactId?.email) {
      await emailService.sendEmail(
        conversation.contactId.email,
        "Reply from our team",
        content
      );
    }

    await Contact.findByIdAndUpdate(contactId, { status: "responded" });

    res.status(201).json(conversation);
  } catch (err) {
    console.error("replyToConversation error:", err);
    res.status(500).json({ message: "Failed to send reply" });
  }
};

export { publicCreateContact, listContacts, getConversation, replyToConversation };
