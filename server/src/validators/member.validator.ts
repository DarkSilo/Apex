import { z } from "zod";

export const updateMemberSchema = z.object({
  name: z.string().min(2).optional(),
  sport: z.string().optional(),
  membershipType: z.enum(["monthly", "annual", "lifetime"]).optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const attendanceSchema = z.object({
  date: z.string().optional(),
  sessionId: z.string().optional(),
});
