import { Request, Response } from "express";
import mongoose from "mongoose";
import Payment from "../models/Payment";
import User from "../models/User";
import { predictAttendance } from "../services/prediction.service";
import { AuthRequest } from "../middleware/auth";

export const getAllPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, method, startDate, endDate, memberId } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (method) query.method = method;
    if (req.user?.role === "member") {
      query.memberId = req.user.id;
    } else if (memberId) {
      query.memberId = memberId;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const payments = await Payment.find(query)
      .populate("memberId", "name email sport")
      .populate("requestedBy", "name email")
      .populate("verifiedBy", "name email")
      .sort({ date: -1 });

    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch payments", error: error.message });
  }
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { memberId, status = "completed" } = req.body;

    const member = await User.findById(memberId);
    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    const payment = await Payment.create(req.body);
    const populated = await payment.populate("memberId", "name email sport");

    if (status === "completed" && member.status !== "active") {
      member.status = "active";
      await member.save();
    }

    res.status(201).json({ message: "Payment recorded successfully", payment: populated });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to record payment", error: error.message });
  }
};

export const createPaymentRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { memberId, amount, date, method, description } = req.body;

    const member = await User.findById(memberId);
    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    const payment = await Payment.create({
      memberId,
      amount,
      date: date ? new Date(date) : new Date(),
      method: method || "online",
      description: description || "Membership fee request",
      status: "requested",
      requestedBy: req.user?.id,
    });

    const populated = await payment.populate("memberId", "name email sport");
    res.status(201).json({ message: "Payment request created successfully", payment: populated });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create payment request", error: error.message });
  }
};

export const submitPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.id;
    const memberId = req.user?.id;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      res.status(404).json({ message: "Payment request not found" });
      return;
    }

    if (payment.memberId.toString() !== memberId) {
      res.status(403).json({ message: "You can only submit your own payment requests." });
      return;
    }

    if (!["requested", "pending"].includes(payment.status)) {
      res.status(400).json({ message: "Only requested or pending payments can be submitted." });
      return;
    }

    payment.method = req.body.method;
    payment.memberReference = req.body.memberReference;
    payment.memberNote = req.body.memberNote;
    payment.paidAt = new Date();
    payment.status = "submitted";
    await payment.save();

    res.json({ message: "Payment submitted successfully", payment });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to submit payment", error: error.message });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.id;
    const { isApproved, verificationNote } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    if (payment.status !== "submitted") {
      res.status(400).json({ message: "Only submitted payments can be verified." });
      return;
    }

    payment.status = isApproved ? "completed" : "failed";
    if (req.user?.id) {
      payment.verifiedBy = new mongoose.Types.ObjectId(req.user.id);
    }
    payment.verifiedAt = new Date();
    payment.verificationNote = verificationNote;
    await payment.save();

    if (isApproved) {
      const member = await User.findById(payment.memberId);
      if (member && member.status !== "active") {
        member.status = "active";
        await member.save();
      }
    }

    const populated = await payment.populate("memberId", "name email sport");

    res.json({
      message: isApproved ? "Payment verified successfully" : "Payment rejected",
      payment: populated,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to verify payment", error: error.message });
  }
};

export const getMonthlyReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;
    const currentDate = new Date();
    const targetYear = year ? Number.parseInt(year as string, 10) : currentDate.getFullYear();
    const targetMonth = month ? Number.parseInt(month as string, 10) - 1 : currentDate.getMonth();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const [payments, summary] = await Promise.all([
      Payment.find({
        date: { $gte: startDate, $lte: endDate },
        status: "completed",
      }).populate("memberId", "name email sport"),

      Payment.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lte: endDate },
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            totalPayments: { $sum: 1 },
            avgPayment: { $avg: "$amount" },
          },
        },
      ]),
    ]);

    const monthlyBreakdown = await Payment.aggregate([
      {
        $match: {
          date: { $gte: new Date(targetYear, 0, 1), $lte: new Date(targetYear, 11, 31) },
          status: "completed",
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      period: { year: targetYear, month: targetMonth + 1 },
      summary: summary[0] || { totalRevenue: 0, totalPayments: 0, avgPayment: 0 },
      monthlyBreakdown,
      payments,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to generate report", error: error.message });
  }
};

export const getReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.id).populate(
      "memberId",
      "name email sport membershipType"
    );

    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    const memberDoc = payment.memberId as unknown as { _id?: { toString(): string } };
    if (req.user?.role === "member" && memberDoc?._id?.toString() !== req.user.id) {
      res.status(403).json({ message: "Access denied. Insufficient permissions." });
      return;
    }

    res.json({
      receiptNumber: payment.receiptNumber,
      member: payment.memberId,
      amount: payment.amount,
      date: payment.date,
      method: payment.method,
      status: payment.status,
      description: payment.description,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to generate receipt", error: error.message });
  }
};

export const getPrediction = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await predictAttendance();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to generate prediction", error: error.message });
  }
};
