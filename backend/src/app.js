import express from "express";
import cors from "cors";
import connectDB, { checkDB } from "./config/db.js";
import authRoutes from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import workspaceRoutes from "../routes/workspaceRoutes.js";
import serviceTypeRoutes from "../routes/serviceTypeRoutes.js";
import contactConversationRoutes from "../routes/contactConversationRoutes.js";
import bookingRoutes from "../routes/bookingRoutes.js";
import inventoryRoutes from "../routes/inventoryRoutes.js";
import alertRoutes from "../routes/alertRoutes.js";
import dashboardRoutes from "../routes/dashboardRoutes.js";
import emailIntegrationRoutes from "../routes/emailIntegration.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CareOps API is running");
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
