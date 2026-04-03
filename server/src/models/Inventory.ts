import mongoose, { Schema, Document } from "mongoose";

export interface IInventory extends Document {
  usageHistory: Array<{
    date: Date;
    type: "in" | "out" | "adjustment";
    change: number;
    previousStock: number;
    newStock: number;
    reason: string;
  }>;
  itemName: string;
  category: string;
  currentStock: number;
  condition: "new" | "good" | "fair" | "poor";
  minThreshold: number;
  sport: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    itemName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    currentStock: { type: Number, required: true, min: 0 },
    condition: {
      type: String,
      enum: ["new", "good", "fair", "poor"],
      default: "good",
    },
    minThreshold: { type: Number, required: true, min: 0, default: 5 },
    sport: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    usageHistory: [
      {
        date: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ["in", "out", "adjustment"],
          default: "adjustment",
        },
        change: { type: Number, required: true },
        previousStock: { type: Number, required: true, min: 0 },
        newStock: { type: Number, required: true, min: 0 },
        reason: { type: String, trim: true, default: "Stock adjustment" },
      },
    ],
  },
  { timestamps: true }
);

inventorySchema.index({ category: 1 });
inventorySchema.index({ sport: 1 });

export default mongoose.model<IInventory>("Inventory", inventorySchema);
