import Booking from "../models/Bookings.js";
import Contact from "../models/Contact.js";
import ServiceType from "../models/Service.js";
import InventoryItem from "../models/InventoryItems.js";
import Workspace from "../models/Workspace.js";
import { emailService } from "../utils/integrationService.js";
import { createInventoryAlert, createFormAlert } from "../utils/alertService.js";

const applyInventoryUsage = async (workspaceId, serviceTypeId) => {
  const items = await InventoryItem.find({ workspaceId, serviceTypeId });

  for (const item of items) {
    item.quantity = Math.max(0, item.quantity - (item.quantityPerBooking || 1));
    await item.save();

    if (item.quantity <= item.threshold) {
      await createInventoryAlert(workspaceId, item);
    }
  }
};

const publicCreateBooking = async (req, res) => {
  try {
    const { workspaceId, serviceTypeId, date, contact } = req.body;
    if (!workspaceId || !serviceTypeId || !date || !contact) {
      return res.status(400).json({ message: "workspaceId, serviceTypeId, date, contact required" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || !workspace.isActive) {
      return res.status(400).json({ message: "Workspace not active" });
    }

    const serviceType = await ServiceType.findOne({ _id: serviceTypeId, workspaceId });
    if (!serviceType) {
      return res.status(404).json({ message: "Service type not found" });
    }

    const orConditions = [];
    if (contact.email) orConditions.push({ email: contact.email });
    if (contact.phone) orConditions.push({ phone: contact.phone });

    let existingContact = await Contact.findOne({
      workspaceId,
      $or: orConditions.length ? orConditions : [{ _id: null }],
    });

    if (!existingContact) {
      existingContact = await Contact.create({
        workspaceId,
        name: contact.name || "Customer",
        email: contact.email,
        phone: contact.phone,
        status: "contacted",
      });
    }

    const forms = [];

    const booking = await Booking.create({
      workspaceId,
      contactId: existingContact._id,
      serviceTypeId: serviceType._id,
      date,
      forms,
      status: "confirmed",
    });

    if (existingContact.email) {
      await emailService.sendEmail(
        existingContact.email,
        "Booking confirmed",
        `Your booking for ${serviceType.name} on ${new Date(date).toLocaleString()} is confirmed.`
      );
    }

    await applyInventoryUsage(workspaceId, serviceType._id);

    res.status(201).json(booking);
  } catch (err) {
    console.error("publicCreateBooking error:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

const createBooking = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { contactId, serviceTypeId, date, forms } = req.body;

    const [contact, serviceType] = await Promise.all([
      Contact.findOne({ _id: contactId, workspaceId }),
      ServiceType.findOne({ _id: serviceTypeId, workspaceId }),
    ]);

    if (!contact || !serviceType) {
      return res.status(404).json({ message: "Contact or service type not found" });
    }

    const booking = await Booking.create({
      workspaceId,
      contactId: contact._id,
      serviceTypeId: serviceType._id,
      date,
      forms: forms || [],
    });

    if (contact.email) {
      await emailService.sendEmail(
        contact.email,
        "Booking confirmed",
        `Your booking for ${serviceType.name} on ${new Date(date).toLocaleString()} is confirmed.`
      );
    }

    await applyInventoryUsage(workspaceId, serviceType._id);

    res.status(201).json(booking);
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

const getBookings = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const bookings = await Booking.find({ workspaceId })
      .populate("contactId")
      .populate("serviceTypeId")
      .sort({ date: 1 });
    res.json(bookings);
  } catch (err) {
    console.error("getBookings error:", err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const workspaceId = req.user.workspaceId;
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findOneAndUpdate(
      { _id: id, workspaceId },
      { status },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    res.status(500).json({ message: "Failed to update booking status" });
  }
};

const updateBookingForm = async (req, res) => {
  try {
    const { bookingId, formIndex } = req.params;
    const { fields, status } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const idx = parseInt(formIndex, 10);
    if (isNaN(idx) || !booking.forms[idx]) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (Array.isArray(fields)) {
      booking.forms[idx].fields = fields;
    }
    if (status) {
      booking.forms[idx].status = status;
    }

    await booking.save();

    if (booking.forms[idx].status === "overdue") {
      await createFormAlert(
        booking.workspaceId,
        booking._id,
        `Form '${booking.forms[idx].title}' is overdue`
      );
    }

    res.json(booking.forms[idx]);
  } catch (err) {
    console.error("updateBookingForm error:", err);
    res.status(500).json({ message: "Failed to update form" });
  }
};

export {
  publicCreateBooking,
  createBooking,
  getBookings,
  updateBookingStatus,
  updateBookingForm,
};
