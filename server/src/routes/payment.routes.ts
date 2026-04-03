import { Router } from "express";
import {
  getAllPayments,
  createPayment,
  getMonthlyReport,
  getReceipt,
  getPrediction,
} from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { paymentSchema } from "../validators/payment.validator";

const router = Router();

router.use(authenticate);

router.get("/", authorize("admin", "coach", "member"), getAllPayments);
router.post("/", authorize("admin"), validate(paymentSchema), createPayment);
router.get("/report", authorize("admin", "coach", "member"), getMonthlyReport);
router.get("/prediction", authorize("admin", "coach", "member"), getPrediction);
router.get("/receipt/:id", authorize("admin", "coach", "member"), getReceipt);

export default router;
