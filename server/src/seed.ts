import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "./config/db";
import User from "./models/User";
import Inventory from "./models/Inventory";
import Session from "./models/Session";
import Payment from "./models/Payment";

dotenv.config();

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Inventory.deleteMany({}),
    Session.deleteMany({}),
    Payment.deleteMany({}),
  ]);

  console.log("🧹 Cleared existing data");

  const hashedPassword = await bcrypt.hash("password123", 12);

  // ─── Users ───────────────────────────────────────────────
  const admin = await User.create({
    name: "Kamal Perera",
    email: "admin@apex.lk",
    password: hashedPassword,
    role: "admin",
    sport: "Cricket",
    membershipType: "lifetime",
    status: "active",
    phone: "+94 71 234 5678",
    attendance: [],
  });

  const coaches = await User.insertMany([
    {
      name: "Nimal Fernando",
      email: "nimal.coach@apex.lk",
      password: hashedPassword,
      role: "coach",
      sport: "Cricket",
      membershipType: "annual",
      status: "active",
      phone: "+94 77 345 6789",
      attendance: [],
    },
    {
      name: "Suresh Jayawardena",
      email: "suresh.coach@apex.lk",
      password: hashedPassword,
      role: "coach",
      sport: "Football",
      membershipType: "annual",
      status: "active",
      phone: "+94 76 456 7890",
      attendance: [],
    },
    {
      name: "Chamari Silva",
      email: "chamari.coach@apex.lk",
      password: hashedPassword,
      role: "coach",
      sport: "Badminton",
      membershipType: "annual",
      status: "active",
      phone: "+94 70 567 8901",
      attendance: [],
    },
  ]);

  // Generate 12 weeks of historical attendance data
  const generateAttendance = () => {
    const attendance: Array<{ date: Date; sessionId: mongoose.Types.ObjectId }> = [];
    const now = new Date();
    for (let week = 12; week >= 1; week--) {
      const sessionsPerWeek = Math.floor(Math.random() * 3) + 1;
      for (let s = 0; s < sessionsPerWeek; s++) {
        const date = new Date(now);
        date.setDate(date.getDate() - week * 7 + Math.floor(Math.random() * 7));
        attendance.push({
          date,
          sessionId: new mongoose.Types.ObjectId(),
        });
      }
    }
    return attendance;
  };

  const members = await User.insertMany([
    {
      name: "Dinesh Rajapaksa",
      email: "dinesh@apex.lk",
      password: hashedPassword,
      role: "member",
      sport: "Cricket",
      membershipType: "monthly",
      status: "active",
      phone: "+94 71 111 2222",
      attendance: generateAttendance(),
    },
    {
      name: "Lakshmi Wijesinghe",
      email: "lakshmi@apex.lk",
      password: hashedPassword,
      role: "member",
      sport: "Cricket",
      membershipType: "annual",
      status: "active",
      phone: "+94 77 222 3333",
      attendance: generateAttendance(),
    },
    {
      name: "Ashan De Silva",
      email: "ashan@apex.lk",
      password: hashedPassword,
      role: "member",
      sport: "Football",
      membershipType: "monthly",
      status: "active",
      phone: "+94 76 333 4444",
      attendance: generateAttendance(),
    },
    {
      name: "Nimali Herath",
      email: "nimali@apex.lk",
      password: hashedPassword,
      role: "member",
      sport: "Football",
      membershipType: "annual",
      status: "active",
      phone: "+94 70 444 5555",
      attendance: generateAttendance(),
    },
    {
      name: "Roshan Bandara",
      email: "roshan@apex.lk",
      password: hashedPassword,
      role: "member",
      sport: "Badminton",
      membershipType: "monthly",
      status: "active",
      phone: "+94 71 555 6666",
      attendance: generateAttendance(),
    },
    {
      name: "Sanduni Kumari",
      email: "sanduni@apex.lk",
      password: hashedPassword,
      role: "member",
      sport: "Badminton",
      membershipType: "lifetime",
      status: "active",
      phone: "+94 77 666 7777",
      attendance: generateAttendance(),
    },
    {
      name: "Tharanga Peris",
      email: "tharanga@apex.lk",
      password: hashedPassword,
      role: "member",
      sport: "Cricket",
      membershipType: "monthly",
      status: "inactive",
      phone: "+94 76 777 8888",
      attendance: generateAttendance(),
    },
    {
      name: "Kavindi Mendis",
      email: "kavindi@apex.lk",
      password: hashedPassword,
      role: "member",
      sport: "Football",
      membershipType: "annual",
      status: "active",
      phone: "+94 70 888 9999",
      attendance: generateAttendance(),
    },
    {
      name: "Isuru Gunaratne",
      email: "isuru@apex.lk",
      password: hashedPassword,
      role: "member",
      sport: "Cricket",
      membershipType: "annual",
      status: "active",
      phone: "+94 71 999 0000",
      attendance: generateAttendance(),
    },
    {
      name: "Harsha Weerasinghe",
      email: "harsha@apex.lk",
      password: hashedPassword,
      role: "member",
      sport: "Badminton",
      membershipType: "monthly",
      status: "active",
      phone: "+94 77 000 1111",
      attendance: generateAttendance(),
    },
  ]);

  console.log(`👤 Created ${members.length} members, ${coaches.length} coaches, 1 admin`);

  // ─── Inventory ───────────────────────────────────────────
  await Inventory.insertMany([
    { itemName: "Cricket Bat", category: "Equipment", currentStock: 15, condition: "good", minThreshold: 5, sport: "Cricket", description: "Standard willow cricket bats" },
    { itemName: "Cricket Ball", category: "Equipment", currentStock: 30, condition: "new", minThreshold: 10, sport: "Cricket", description: "Red leather cricket balls" },
    { itemName: "Cricket Pads", category: "Protective", currentStock: 8, condition: "good", minThreshold: 4, sport: "Cricket", description: "Batting pads" },
    { itemName: "Cricket Helmet", category: "Protective", currentStock: 3, condition: "fair", minThreshold: 5, sport: "Cricket", description: "Safety helmets with grille" },
    { itemName: "Football", category: "Equipment", currentStock: 12, condition: "good", minThreshold: 5, sport: "Football", description: "Size 5 match footballs" },
    { itemName: "Football Boots", category: "Footwear", currentStock: 2, condition: "fair", minThreshold: 8, sport: "Football", description: "Studded football boots (various sizes)" },
    { itemName: "Goal Net", category: "Equipment", currentStock: 4, condition: "good", minThreshold: 2, sport: "Football", description: "Full-size goal nets" },
    { itemName: "Shin Guards", category: "Protective", currentStock: 18, condition: "new", minThreshold: 6, sport: "Football", description: "Protective shin guards" },
    { itemName: "Badminton Racket", category: "Equipment", currentStock: 20, condition: "good", minThreshold: 6, sport: "Badminton", description: "Carbon fiber rackets" },
    { itemName: "Shuttlecock", category: "Equipment", currentStock: 4, condition: "new", minThreshold: 15, sport: "Badminton", description: "Feather shuttlecocks (tube of 12)" },
    { itemName: "Badminton Net", category: "Equipment", currentStock: 3, condition: "good", minThreshold: 2, sport: "Badminton", description: "Tournament standard nets" },
    { itemName: "Training Cones", category: "Training", currentStock: 40, condition: "good", minThreshold: 10, sport: "Football", description: "Orange training marker cones" },
  ]);

  console.log("📦 Created 12 inventory items");

  // ─── Sessions ────────────────────────────────────────────
  const now = new Date();
  const sessions = [];
  const sessionData = [
    { eventName: "Cricket Practice - Batting", sport: "Cricket", coachIdx: 0, location: "Main Cricket Ground", dayOffset: 1 },
    { eventName: "Cricket Practice - Bowling", sport: "Cricket", coachIdx: 0, location: "Indoor Nets", dayOffset: 3 },
    { eventName: "Football Training - Fitness", sport: "Football", coachIdx: 1, location: "Football Field A", dayOffset: 2 },
    { eventName: "Football Match Practice", sport: "Football", coachIdx: 1, location: "Football Field A", dayOffset: 5 },
    { eventName: "Badminton Singles Drill", sport: "Badminton", coachIdx: 2, location: "Indoor Court 1", dayOffset: 1 },
    { eventName: "Badminton Doubles Strategy", sport: "Badminton", coachIdx: 2, location: "Indoor Court 2", dayOffset: 4 },
  ];

  for (const s of sessionData) {
    const sessionDate = new Date(now);
    sessionDate.setDate(sessionDate.getDate() + s.dayOffset);

    sessions.push({
      eventName: s.eventName,
      date: sessionDate,
      startTime: "09:00",
      endTime: "11:00",
      location: s.location,
      coachId: coaches[s.coachIdx]._id,
      sport: s.sport,
      status: "scheduled",
      maxParticipants: 20,
      description: `Regular ${s.sport.toLowerCase()} training session`,
    });
  }

  // Add some past completed sessions
  for (let weekAgo = 1; weekAgo <= 4; weekAgo++) {
    const pastDate = new Date(now);
    pastDate.setDate(pastDate.getDate() - weekAgo * 7);
    sessions.push({
      eventName: `Weekly Cricket Training W-${weekAgo}`,
      date: pastDate,
      startTime: "09:00",
      endTime: "11:00",
      location: "Main Cricket Ground",
      coachId: coaches[0]._id,
      sport: "Cricket",
      status: "completed",
      maxParticipants: 20,
      description: "Past weekly training",
    });
  }

  await Session.insertMany(sessions);
  console.log(`📅 Created ${sessions.length} sessions`);

  // ─── Payments ────────────────────────────────────────────
  const payments = [];
  const methods: Array<"cash" | "card" | "bank_transfer" | "online"> = ["cash", "card", "bank_transfer", "online"];

  for (const member of members) {
    // Generate 1-3 months of payments
    const monthsOfPayments = Math.floor(Math.random() * 3) + 1;
    for (let m = 0; m < monthsOfPayments; m++) {
      const paymentDate = new Date(now);
      paymentDate.setMonth(paymentDate.getMonth() - m);
      paymentDate.setDate(Math.floor(Math.random() * 5) + 1);

      const amounts: Record<string, number> = {
        monthly: 2500,
        annual: 25000,
        lifetime: 75000,
      };

      payments.push({
        memberId: member._id,
        amount: amounts[(member as any).membershipType] || 2500,
        date: paymentDate,
        status: m === 0 && Math.random() > 0.8 ? "pending" : "completed",
        method: methods[Math.floor(Math.random() * methods.length)],
        description: `${(member as any).membershipType} membership fee`,
      });
    }
  }

  await Payment.insertMany(payments);
  console.log(`💰 Created ${payments.length} payments`);

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Login Credentials:");
  console.log("   Admin:  admin@apex.lk / password123");
  console.log("   Coach:  nimal.coach@apex.lk / password123");
  console.log("   Member: dinesh@apex.lk / password123");

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
