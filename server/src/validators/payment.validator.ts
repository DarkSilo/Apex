import { z } from "zod";

export const paymentSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  amount: z.number().min(0, "Amount must be positive"),
  date: z.string().optional(),
  status: z.enum(["completed", "pending", "failed", "refunded"]).optional(),
  method: z.enum(["cash", "card", "bank_transfer", "online"]).optional(),
  description: z.string().optional(),
});
