import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  memberId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  status: "requested" | "submitted" | "completed" | "pending" | "failed" | "refunded";
  method: "cash" | "card" | "bank_transfer" | "online";
  description: string;
  receiptNumber: string;
  requestedBy?: mongoose.Types.ObjectId;
  paidAt?: Date;
  memberReference?: string;
  memberNote?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  verificationNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    status: {
      type: String,
      enum: ["requested", "submitted", "completed", "pending", "failed", "refunded"],
      default: "completed",
    },
    method: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "online"],
      default: "cash",
    },
    description: { type: String, trim: true, default: "Membership Fee" },
    receiptNumber: { type: String, unique: true },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    paidAt: { type: Date },
    memberReference: { type: String, trim: true },
    memberNote: { type: String, trim: true },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: { type: Date },
    verificationNote: { type: String, trim: true },
  },
  { timestamps: true }
);

paymentSchema.index({ memberId: 1 });
paymentSchema.index({ date: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ requestedBy: 1 });
paymentSchema.index({ verifiedBy: 1 });

paymentSchema.pre("save", function (next) {
  if (!this.receiptNumber) {
    this.receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

export default mongoose.model<IPayment>("Payment", paymentSchema);
