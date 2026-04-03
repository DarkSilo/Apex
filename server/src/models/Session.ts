import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  eventName: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  coachId: mongoose.Types.ObjectId;
  sport: string;
  status: "scheduled" | "completed" | "cancelled";
  maxParticipants: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    eventName: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    coachId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sport: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    maxParticipants: { type: Number, default: 30 },
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

sessionSchema.index({ date: 1 });
sessionSchema.index({ coachId: 1 });
sessionSchema.index({ status: 1 });

export default mongoose.model<ISession>("Session", sessionSchema);
