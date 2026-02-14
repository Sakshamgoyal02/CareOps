import Booking from "../models/Bookings.js";
import Alert from "../models/Alerts.js";

const getDashboardSummary = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const endOfUpcoming = new Date();
    endOfUpcoming.setDate(endOfUpcoming.getDate() + 30);

    const [todayBookings, upcomingBookings, pendingForms, lowInventoryAlerts, missedMessagesAlerts] =
      await Promise.all([
        Booking.find({
          workspaceId,
          date: { $gte: startOfDay, $lte: endOfDay },
        }),
        Booking.find({
          workspaceId,
          date: { $gt: endOfDay, $lte: endOfUpcoming },
          status: "confirmed",
        }),
        Booking.find({
          workspaceId,
          "forms.status": "pending",
        }),
        Alert.find({ workspaceId, type: "inventory", resolved: false }),
        Alert.find({ workspaceId, type: "message", resolved: false }),
      ]);

    const completedCount = todayBookings.filter((b) => b.status === "completed").length;
    const noShowCount = todayBookings.filter((b) => b.status === "no-show").length;

    res.json({
      bookings: {
        today: todayBookings.length,
        upcoming: upcomingBookings.length,
        completed: completedCount,
        noShow: noShowCount,
      },
      forms: {
        pending: pendingForms.length,
      },
      alerts: {
        lowInventory: lowInventoryAlerts.length,
        missedMessages: missedMessagesAlerts.length,
      },
    });
  } catch (err) {
    console.error("getDashboardSummary error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
};

export { getDashboardSummary };
