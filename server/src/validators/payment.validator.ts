import { z } from "zod";

export const paymentSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  amount: z.number().min(0, "Amount must be positive"),
  date: z.string().optional(),
  status: z.enum(["requested", "submitted", "completed", "pending", "failed", "refunded"]).optional(),
  method: z.enum(["cash", "card", "bank_transfer", "online"]).optional(),
  description: z.string().optional(),
});

export const paymentRequestSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  amount: z.number().min(0, "Amount must be positive"),
  date: z.string().optional(),
  method: z.enum(["cash", "card", "bank_transfer", "online"]).optional(),
  description: z.string().optional(),
});

export const submitPaymentSchema = z.object({
  method: z.enum(["cash", "card", "bank_transfer", "online"]),
  memberReference: z.string().min(3, "Payment reference is required"),
  memberNote: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  isApproved: z.boolean(),
  verificationNote: z.string().optional(),
});
