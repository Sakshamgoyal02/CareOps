import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        workspaceId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        name:{
            type: String,
            required: true,
        },
        email:{
            type: String,
            lowercase: true,
        },
        phone:{
            type: String,
        },
        status: {
            type: String,
            enum: ['new', 'contacted', 'responded'],
            default: 'new',
        },
        optionalMessage:{
            type: String,
            maxlength: 100,
        },
    },
    {timestamps: true},
);

// Ensure uniqueness for email+workspace and phone+workspace when those fields are provided
contactSchema.index({ email: 1, workspaceId: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });
contactSchema.index({ phone: 1, workspaceId: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;

