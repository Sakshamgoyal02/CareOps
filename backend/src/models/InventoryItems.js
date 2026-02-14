import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
     serviceTypeId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceType",
            required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    threshold: {
      type: Number,
      required: true,
      min: 0, 
    },
     quantityPerBooking: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { timestamps: true }
);

const InventoryItem = mongoose.model("InventoryItem", inventoryItemSchema);
export default InventoryItem;
