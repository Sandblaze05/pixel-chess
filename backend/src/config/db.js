import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) {
        console.log("MongoDB is already connected");
        return;
    }
    if (mongoose.connections.length > 0) {
        isConnected = true;
        console.log("Using existing MongoDB connection");
        return;
    }
    try {
        await mongoose.connect(MONGO_URI);
        isConnected = true;
        console.log("MongoDB connected");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}