import dotenv from "dotenv";
import connectDB from "./config/db";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start server
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Apex Server running on port ${PORT}`);
  });
};

void start();

export default app;
