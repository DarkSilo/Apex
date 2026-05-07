import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db";
import User from "./models/User";
import Payment from "./models/Payment";

dotenv.config();

const adjustHistory = async () => {
  await connectDB();

  console.log("🧹 Cleaning up previously added historical data...");
  const deleteResult = await Payment.deleteMany({
    receiptNumber: { $regex: /^REC-HIST-/ }
  });
  console.log(`🗑️ Removed ${deleteResult.deletedCount} old historical records.`);

  console.log("🔍 Fetching existing members...");
  const members = await User.find({ role: "member", status: "active" });

  if (members.length === 0) {
    console.log("❌ No active members found.");
    process.exit(1);
  }

  const months = [
    { name: "January", index: 0 },
    { name: "February", index: 1 },
    { name: "March", index: 2 }
  ];

  const year = 2026;
  const newPayments = [];

  for (const month of months) {
    console.log(`📊 Generating data for ${month.name}...`);
    
    // To target 20,000 - 40,000 per month:
    // We'll pick a random number of members between 8 and 14.
    // Each will pay between 2000 and 3000.
    
    const targetMemberCount = Math.floor(Math.random() * (14 - 8 + 1)) + 8;
    const shuffledMembers = [...members].sort(() => 0.5 - Math.random());
    const selectedMembers = shuffledMembers.slice(0, targetMemberCount);
    
    let monthlyTotal = 0;
    for (const member of selectedMembers) {
      const amount = Math.floor(Math.random() * (3000 - 2000 + 1)) + 2000;
      monthlyTotal += amount;
      
      const paymentDate = new Date(year, month.index, Math.floor(Math.random() * 25) + 1);
      
      newPayments.push({
        memberId: member._id,
        amount: amount,
        date: paymentDate,
        status: "completed",
        method: Math.random() > 0.5 ? "cash" : "card_online",
        description: `Monthly Fee - ${month.name}`,
        paymentForMonth: month.name,
        receiptNumber: `REC-HIST-${month.name.substring(0,3).toUpperCase()}-${member._id.toString().substring(18)}`
      });
    }
    console.log(`   - ${month.name} Total: LKR ${monthlyTotal.toLocaleString()} (${selectedMembers.length} payments)`);
  }

  if (newPayments.length > 0) {
    await Payment.insertMany(newPayments);
    console.log(`✅ Successfully added ${newPayments.length} balanced historical payments.`);
  }

  mongoose.connection.close();
  process.exit(0);
};

adjustHistory().catch((err) => {
  console.error("❌ History adjustment failed:", err);
  process.exit(1);
});
