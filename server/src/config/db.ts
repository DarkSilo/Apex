import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  connectionPromise ??= mongoose.connect(uri);

  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
};

export default connectDB;
