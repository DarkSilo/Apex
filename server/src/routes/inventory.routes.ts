import { Router } from "express";
import {
  getAllInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockAlerts,
} from "../controllers/inventory.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { inventorySchema, updateInventorySchema } from "../validators/inventory.validator";

const router = Router();

router.use(authenticate);

router.get("/", getAllInventory);
router.get("/alerts", authorize("admin", "coach", "member"), getLowStockAlerts);
router.post("/", authorize("admin"), validate(inventorySchema), createInventoryItem);
router.put("/:id", authorize("admin"), validate(updateInventorySchema), updateInventoryItem);
router.delete("/:id", authorize("admin"), deleteInventoryItem);

export default router;
