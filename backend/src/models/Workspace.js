import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema(
    {
     name:{
        type: String,
        required: true,  
     },
     address:{
        type: String,
        required: true,
     },
     contactEmail:{
        type: String,
        required: true,
        lowercase: true,
     },
     timezone:{
       type: String,
       required: true,
     },
        // Email integration config stored per-workspace
        emailConfig: {
            smtpHost: { type: String },
            smtpPort: { type: Number },
            smtpSecure: { type: Boolean, default: true },
            smtpUser: { type: String },
            smtpPass: { type: String },
            emailFrom: { type: String },
            isConfigured: { type: Boolean, default: false },
        },

        //  Activation checks
        emailConnected: {
            type: Boolean,
            default: false,
        },
    isActive: {
        type: Boolean,
        default: false,
    },
},
{timestamps: true}
);

const Workspace = mongoose.model("Workspace", WorkspaceSchema);
export default Workspace;