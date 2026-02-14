import express from "express";
import cors from "cors";
import connectDB, { checkDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import serviceTypeRoutes from "./routes/serviceTypeRoutes.js";
import contactConversationRoutes from "./routes/contactConversationRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import emailIntegrationRoutes from "./routes/emailIntegration.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CareOps API is running");
});

// Simple health endpoint to help with deployments and debugging.
// Returns whether the app is connected to MongoDB and whether key env vars are present (values not exposed).
app.get("/api/health", (req, res) => {
  try {
    const dbOk = checkDB();
    res.json({
      status: "ok",
      dbConnected: !!dbOk,
      env: {
        MONGO_URI_set: !!process.env.MONGO_URI,
        JWT_SECRET_set: !!process.env.JWT_SECRET,
        SMTP_configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM),
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.use("/api", (req, res, next) => {
  if (!checkDB()) {
    return res.status(503).json({
      message: "Database unavailable. Check MongoDB Atlas: add your IP to Network Access (0.0.0.0/0 for dev).",
    });
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/services", serviceTypeRoutes);
app.use("/api/inbox", contactConversationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/email-integration", emailIntegrationRoutes);

export default app;
