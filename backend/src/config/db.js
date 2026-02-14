import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        isConnected = true;
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        console.error("Fix: Add your IP to MongoDB Atlas Network Access, or use 0.0.0.0/0 for dev.");
        isConnected = false;
    }
};

export const checkDB = () => isConnected;
export default connectDB;