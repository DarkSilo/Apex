import { z } from "zod";

export const sessionSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  location: z.string().min(1, "Location is required"),
  coachId: z.string().min(1, "Coach is required"),
  sport: z.string().min(1, "Sport is required"),
  maxParticipants: z.number().optional(),
  description: z.string().optional(),
});

export const updateSessionSchema = sessionSchema.partial();
