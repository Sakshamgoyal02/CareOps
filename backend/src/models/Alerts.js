import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    type: {
      type: String,
      enum: ["message", "form", "inventory", "booking"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "refModel",
    },
    refModel: {
      type: String,
      enum: ["Contact", "Booking", "InventoryItem", "FormSubmission"],
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Alert = mongoose.model("Alert", alertSchema);
export default Alert;
