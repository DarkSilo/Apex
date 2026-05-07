import { z } from "zod";

const paymentMethodSchema = z.enum(["cash", "card_online", "bank_transfer"]);

const basePaymentSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  amount: z.number().min(1, "Amount must be greater than zero"),
  date: z.string().optional(),
  status: z.enum(["requested", "submitted", "completed", "pending", "failed", "refunded"]).optional(),
  method: paymentMethodSchema.optional(),
  description: z.string().optional(),
  paymentForMonth: z.string().optional(),
});

export const paymentSchema = basePaymentSchema.superRefine((data, ctx) => {
  if ((data.method === "cash" || data.method === "card_online") && data.amount <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["amount"],
      message: "Payment amount must be greater than zero",
    });
  }
});

// Payment request schema - admins can only use cash and card_online methods
export const paymentRequestSchema = basePaymentSchema.superRefine((data, ctx) => {
  // Admins cannot use bank_transfer for payment requests
  if (data.method && data.method === "bank_transfer") {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["method"],
      message: "Payment requests cannot be made with bank transfer. Use cash or Card/Online instead.",
    });
  }
  if ((data.method === "cash" || data.method === "card_online") && data.amount <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["amount"],
      message: "Payment amount must be greater than zero",
    });
  }
});

// Member submission schema - members can choose cash or card_online methods
export const submitPaymentSchema = z.object({
  method: z.enum(["cash", "card_online"]),
  memberReference: z.string().min(3, "Payment reference is required").optional(),
  memberNote: z.string().optional(),
  paymentForMonth: z.string().optional(),
  slipUrl: z.string().url("Slip URL must be a valid URL").optional(),
});

export const cashMarkPaidSchema = z.object({
  paymentForMonth: z.string().optional(),
  verificationNote: z.string().optional(),
});

// Payment create schema for direct admin payments
export const paymentCreateSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  amount: z.number().min(1, "Amount must be greater than zero"),
  date: z.string().optional(),
  method: paymentMethodSchema.optional(),
  description: z.string().optional(),
  paymentForMonth: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  isApproved: z.boolean(),
  verificationNote: z.string().optional(),
});
