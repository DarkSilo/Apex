import { Router } from "express";
import {
  getAllPayments,
  createPayment,
  createPaymentRequest,
  submitPayment,
  verifyPayment,
  getMonthlyReport,
  getReceipt,
  getPrediction,
} from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import {
  paymentSchema,
  paymentRequestSchema,
  submitPaymentSchema,
  verifyPaymentSchema,
} from "../validators/payment.validator";

const router = Router();

router.use(authenticate);

router.get("/", authorize("admin", "coach", "member"), getAllPayments);
router.post("/", authorize("admin"), validate(paymentSchema), createPayment);
router.post("/request", authorize("admin"), validate(paymentRequestSchema), createPaymentRequest);
router.patch("/:id/submit", authorize("member"), validate(submitPaymentSchema), submitPayment);
router.patch("/:id/verify", authorize("admin"), validate(verifyPaymentSchema), verifyPayment);
router.get("/report", authorize("admin", "coach", "member"), getMonthlyReport);
router.get("/prediction", authorize("admin", "coach", "member"), getPrediction);
router.get("/receipt/:id", authorize("admin", "coach", "member"), getReceipt);

export default router;
