import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "coach" | "member";
  sport: string;
  membershipType: "monthly" | "annual" | "lifetime";
  status: "active" | "inactive";
  phone: string;
  attendance: Array<{
    date: Date;
    sessionId: mongoose.Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "coach", "member"],
      default: "member",
    },
    sport: { type: String, required: true, trim: true },
    membershipType: {
      type: String,
      enum: ["monthly", "annual", "lifetime"],
      default: "monthly",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    phone: { type: String, trim: true },
    attendance: [
      {
        date: { type: Date, default: Date.now },
        sessionId: { type: Schema.Types.ObjectId, ref: "Session" },
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export default mongoose.model<IUser>("User", userSchema);
