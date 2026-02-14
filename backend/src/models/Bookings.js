import mongoose from "mongoose";

const formFieldSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["text", "number", "email", "date", "checkbox", "file"],
      required: true,
    },
    value: { type: mongoose.Mixed }, 
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: "Contact", required: true },
    serviceTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceType", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["confirmed", "completed", "no-show"], default: "confirmed" },

    forms: [
      {
        title: { type: String, required: true, trim: true },
        fields: [formFieldSchema],
        status: { type: String, enum: ["pending", "completed", "overdue"], default: "pending" },
      },
    ],
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
