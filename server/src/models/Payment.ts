import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  memberId: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  status: "completed" | "pending" | "failed" | "refunded";
  method: "cash" | "card" | "bank_transfer" | "online";
  description: string;
  receiptNumber: string;
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
      enum: ["completed", "pending", "failed", "refunded"],
      default: "completed",
    },
    method: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "online"],
      default: "cash",
    },
    description: { type: String, trim: true, default: "Membership Fee" },
    receiptNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

paymentSchema.index({ memberId: 1 });
paymentSchema.index({ date: 1 });
paymentSchema.index({ status: 1 });

paymentSchema.pre("save", function (next) {
  if (!this.receiptNumber) {
    this.receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

export default mongoose.model<IPayment>("Payment", paymentSchema);
