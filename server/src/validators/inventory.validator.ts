import { z } from "zod";

export const inventorySchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Category is required"),
  currentStock: z.number().min(0, "Stock cannot be negative"),
  condition: z.enum(["new", "good", "fair", "poor"]).optional(),
  minThreshold: z.number().min(0).optional(),
  sport: z.string().min(1, "Sport is required"),
  description: z.string().optional(),
});

export const updateInventorySchema = inventorySchema.partial();
