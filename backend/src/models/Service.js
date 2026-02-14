import mongoose from "mongoose";

const serviceTypeSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true, 
    },
    availability: {
      type: [String], 
      required: true,
    },
    location: {
      type: String,
      required: true, 
      trim: true,
    },
  },
  { timestamps: true }
);

const ServiceType = mongoose.model("ServiceType", serviceTypeSchema);
export default ServiceType;
