import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB, { checkDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import workspaceRoutes from "./src/routes/workspaceRoutes.js";
import serviceTypeRoutes from "./src/routes/serviceTypeRoutes.js";
import contactConversationRoutes from "./src/routes/contactConversationRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import alertRoutes from "./src/routes/alertRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import emailIntegrationRoutes from "./src/routes/emailIntegration.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

await connectDB();

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});