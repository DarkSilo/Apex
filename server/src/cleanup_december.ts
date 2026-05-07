import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db";
import Payment from "./models/Payment";

dotenv.config();

const cleanupDecember = async () => {
  await connectDB();

  console.log("🔍 Searching for December transactions...");
  
  // Find payments where the date falls in December
  // MongoDB $month operator returns 1-12
  const decPayments = await Payment.aggregate([
    {
      $project: {
        _id: 1,
        month: { $month: "$date" },
        year: { $year: "$date" },
        receiptNumber: 1,
        amount: 1
      }
    },
    {
      $match: {
        month: 12
      }
    }
  ]);

  console.log(`📌 Found ${decPayments.length} transactions in December.`);

  if (decPayments.length > 0) {
    const ids = decPayments.map(p => p._id);
    const deleteResult = await Payment.deleteMany({ _id: { $in: ids } });
    console.log(`🗑️ Successfully removed ${deleteResult.deletedCount} transactions from December.`);
  } else {
    console.log("✅ No December transactions found to remove.");
  }

  mongoose.connection.close();
  process.exit(0);
};

cleanupDecember().catch((err) => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});
