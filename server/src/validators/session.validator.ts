import { z } from "zod";

const combineDateTime = (date: string, time: string): Date => new Date(`${date}T${time}:00`);

const baseSessionSchema = z.object({
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

export const sessionSchema = baseSessionSchema
  .superRefine((data, ctx) => {
    const start = combineDateTime(data.date, data.startTime);
    const end = combineDateTime(data.date, data.endTime);
    const now = new Date();

    if (start.getTime() < now.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date"],
        message: "Cannot create sessions in the past",
      });
    }

    if (end.getTime() <= start.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endTime"],
        message: "End time must be later than start time",
      });
    }
  });

export const updateSessionSchema = baseSessionSchema.partial();
