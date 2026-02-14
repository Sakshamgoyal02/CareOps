import express from "express";
import { requireAuth, requirePermission } from "../middleware/auth.js";
import {
  publicCreateBooking,
  createBooking,
  getBookings,
  updateBookingStatus,
  updateBookingForm,
} from "../controllers/bookingController.js";

const router = express.Router();

router.post("/public", publicCreateBooking);

router.use(requireAuth, requirePermission("bookings"));

router.post("/", createBooking);
router.get("/", getBookings);
router.patch("/:id/status", updateBookingStatus);
router.patch("/:bookingId/forms/:formIndex", updateBookingForm);

export default router;
