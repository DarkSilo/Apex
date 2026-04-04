import type { VercelRequest, VercelResponse } from "@vercel/node";
import dotenv from "dotenv";
import app from "../src/app";
import connectDB from "../src/config/db";

dotenv.config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed", error);
    return res.status(500).json({
      message: "Database connection failed",
    });
  }
}
