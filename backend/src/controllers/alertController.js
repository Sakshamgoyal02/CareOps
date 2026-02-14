import Alert from "../models/Alerts.js";

const getAlerts = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const alerts = await Alert.find({ workspaceId }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    console.error("getAlerts error:", err);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

const resolveAlert = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { id } = req.params;

    const alert = await Alert.findOneAndUpdate(
      { _id: id, workspaceId },
      { resolved: true },
      { new: true }
    );

    if (!alert) return res.status(404).json({ message: "Alert not found" });
    res.json(alert);
  } catch (err) {
    console.error("resolveAlert error:", err);
    res.status(500).json({ message: "Failed to resolve alert" });
  }
};

export { getAlerts, resolveAlert };
