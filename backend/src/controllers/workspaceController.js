import Workspace from "../models/Workspace.js";
import ServiceType from "../models/Service.js";
import { isEmailConfigured } from "../utils/integrationService.js";

const getMyWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.user.workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    const data = workspace.toObject();
    data.integrationStatus = {
        emailConnected: workspace.emailConnected || workspace.emailConfig?.isConfigured || isEmailConfigured(),
    };
    res.json(data);
  } catch (err) {
    console.error("getMyWorkspace error:", err);
    res.status(500).json({ message: "Failed to fetch workspace" });
  }
};

const getIntegrationStatus = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.user.workspaceId);
    res.json({
        emailConnected: (workspace && (workspace.emailConnected || workspace.emailConfig?.isConfigured)) || isEmailConfigured(),
    });
  } catch (err) {
    console.error("getIntegrationStatus error:", err);
    res.status(500).json({ message: "Failed to fetch integration status" });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const updates = (({ name, address, contactEmail, timezone }) => ({
      name,
      address,
      contactEmail,
      timezone,
    }))(req.body);

    const workspace = await Workspace.findByIdAndUpdate(
      req.user.workspaceId,
      updates,
      { new: true }
    );

    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
      // If a contactEmail was provided in this update, mark the workspace as having an email connected
      if (updates.contactEmail) {
        workspace.emailConnected = true;
        await workspace.save();
      }
      res.json(workspace);
  } catch (err) {
    console.error("updateWorkspace error:", err);
    res.status(500).json({ message: "Failed to update workspace" });
  }
};

const activateWorkspace = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Allow activation if workspace has emailConnected flag or workspace-level emailConfig is configured,
    // or if a global SMTP transporter is available via env.
    if (!(workspace.emailConnected || workspace.emailConfig?.isConfigured || isEmailConfigured())) {
      return res.status(400).json({ message: "Email must be configured in backend (SMTP in .env) before activation" });
    }

    const serviceCount = await ServiceType.countDocuments({ workspaceId });
    if (serviceCount === 0) {
      return res.status(400).json({ message: "At least one service type required" });
    }

    workspace.isActive = true;
    await workspace.save();

    res.json({ message: "Workspace activated", workspace });
  } catch (err) {
    console.error("activateWorkspace error:", err);
    res.status(500).json({ message: "Failed to activate workspace" });
  }
};

export { getMyWorkspace, getIntegrationStatus, updateWorkspace, activateWorkspace };
