import { z } from "zod";

const phoneRegex = /^\+?[0-9]{10,15}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => !value || phoneRegex.test(value), {
    message: "Phone number must be 10 to 15 digits",
  });

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().regex(
    passwordRegex,
    "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
  ),
  role: z.enum(["admin", "coach", "member"]).optional(),
  sport: z.string().min(1, "Sport is required"),
  membershipType: z.enum(["monthly", "annual", "lifetime"]).optional(),
  phone: optionalPhoneSchema,
  assignedCoachId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: optionalPhoneSchema,
  sport: z.string().min(1).optional(),
  membershipType: z.enum(["monthly", "annual", "lifetime"]).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().regex(
    passwordRegex,
    "New password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
  ),
});

export const deleteMyAccountSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
});
