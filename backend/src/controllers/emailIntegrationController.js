import Workspace from "../models/Workspace.js";
import nodemailer from "nodemailer";

export const saveEmailConfig = async (req, res) => {
  try {
    const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, emailFrom } = req.body;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !emailFrom) {
      return res.status(400).json({ message: "All email fields are required" });
    }

    const workspace = await Workspace.findById(req.user.workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    workspace.emailConfig = {
      smtpHost,
      smtpPort: parseInt(smtpPort, 10),
      smtpSecure: smtpSecure === true || smtpSecure === "true",
      smtpUser,
      smtpPass,
      emailFrom,
      isConfigured: true,
    };

    workspace.emailConnected = true;
    await workspace.save();

    res.json({ message: "Email configured", emailConnected: true });
  } catch (err) {
    console.error("saveEmailConfig error:", err);
    res.status(500).json({ message: "Failed to save email config" });
  }
};

export const testEmailConfig = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.user.workspaceId);
    if (!workspace || !workspace.emailConfig?.isConfigured) {
      return res.status(400).json({ message: "Email not configured for workspace" });
    }

    const cfg = workspace.emailConfig;
    const transporter = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: cfg.smtpPort || 587,
      secure: !!cfg.smtpSecure,
      auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
    });

    await transporter.verify();
    res.json({ message: "SMTP connection successful" });
  } catch (err) {
    console.error("testEmailConfig error:", err);
    res.status(400).json({ message: "SMTP connection failed: " + err.message });
  }
};

export const getEmailStatus = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.user.workspaceId);
    res.json({
      emailConnected: (workspace && workspace.emailConnected) || false,
      isConfigured: (workspace && workspace.emailConfig?.isConfigured) || false,
    });
  } catch (err) {
    console.error("getEmailStatus error:", err);
    res.status(500).json({ message: "Failed to fetch status" });
  }
};

export const disconnectEmail = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.user.workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    workspace.emailConfig = {
      smtpHost: "",
      smtpPort: 587,
      smtpSecure: true,
      smtpUser: "",
      smtpPass: "",
      emailFrom: "",
      isConfigured: false,
    };
    workspace.emailConnected = false;
    await workspace.save();

    res.json({ message: "Email disconnected" });
  } catch (err) {
    console.error("disconnectEmail error:", err);
    res.status(500).json({ message: "Failed to disconnect" });
  }
};
