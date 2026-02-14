import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        workspaceId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        password:{
            type: String,
            required: true,
        },
        role:{
            type: String,
            enum: ["owner", "staff"],
            required: true,
        },
        permissions: {
            inbox: { type: Boolean, default: false },
            bookings: { type: Boolean, default: false },
            forms: { type: Boolean, default: false },
            inventory: { type: Boolean, default: false },
        },
        isActive:{
            type: Boolean,
            default: true,
        },  
    },
    {timestamps: true}
);

const User = mongoose.model("User", userSchema);
export default User;