import nodemailer from "nodemailer";
import Workspace from "../models/Workspace.js";

const envCfg = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
  from: process.env.EMAIL_FROM,
};

let transporter = null;
let currentWorkspaceId = null;

const initTransporterFromEnv = () => {
  if (!envCfg.host || !envCfg.user || !envCfg.pass || !envCfg.from) return false;
  try {
    transporter = nodemailer.createTransport({
      host: envCfg.host,
      port: envCfg.port || 587,
      secure: !!envCfg.secure,
      auth: { user: envCfg.user, pass: envCfg.pass },
    });
    console.log("[Email] Transporter initialized from env");
    return true;
  } catch (err) {
    console.error("[Email] Env transporter failed:", err.message);
    transporter = null;
    return false;
  }
};

initTransporterFromEnv();

export const initializeEmailTransporter = async (workspaceId) => {
  try {
    const ws = await Workspace.findById(workspaceId);
    if (!ws || !ws.emailConfig?.isConfigured) return initTransporterFromEnv();

    const cfg = ws.emailConfig;
    transporter = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: cfg.smtpPort || 587,
      secure: !!cfg.smtpSecure,
      auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
    });
    currentWorkspaceId = workspaceId;
    console.log("[Email] Transporter initialized from workspace", workspaceId);
    return true;
  } catch (err) {
    console.error("[Email] initialize transporter failed:", err.message);
    transporter = null;
    return false;
  }
};

export const isEmailConfigured = () => !!transporter;

const emailService = {
  async sendEmail(to, subject, body, workspaceId) {
    if (!to || !subject) {
      console.warn("[Email] Skipped: missing to or subject", { to, subject });
      return;
    }

    if (workspaceId && workspaceId !== currentWorkspaceId) {
      await initializeEmailTransporter(workspaceId);
    }

    if (!transporter) {
      console.log("[Email] No SMTP configured – logging only:", { to, subject, body });
      return;
    }

    try {
      let from = envCfg.from;
      if (workspaceId) {
        const ws = await Workspace.findById(workspaceId);
        if (ws?.emailConfig?.emailFrom) from = ws.emailConfig.emailFrom;
      }
      const info = await transporter.sendMail({
        from: from || 'noreply@careops.local',
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text: typeof body === 'string' ? body : JSON.stringify(body),
        html: typeof body === 'string' ? body.replace(/\n/g, '<br>') : undefined,
      });
      console.log('[Email] Sent:', info.messageId, '→', to);
    } catch (err) {
      console.error('[Email] Send failed:', err.message, { to, subject });
    }
  },
};

export { emailService };
