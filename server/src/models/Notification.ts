import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "session_created" | "session_cancelled" | "session_deleted" | "session_rescheduled" | "payment_completed";
  channel: "in_app" | "email";
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["session_created", "session_cancelled", "session_deleted", "session_rescheduled", "payment_completed"],
      required: true,
    },
    channel: {
      type: String,
      enum: ["in_app", "email"],
      default: "in_app",
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

export default mongoose.model<INotification>("Notification", notificationSchema);
