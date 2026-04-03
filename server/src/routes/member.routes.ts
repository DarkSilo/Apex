import { Router } from "express";
import {
  getAllMembers,
  getMemberById,
  updateMember,
  toggleMemberStatus,
  getAttendance,
  logAttendance,
  getDashboardStats,
} from "../controllers/member.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { updateMemberSchema, attendanceSchema } from "../validators/member.validator";

const router = Router();

router.use(authenticate);

router.get("/stats", authorize("admin", "coach", "member"), getDashboardStats);
router.get("/", authorize("admin", "coach", "member"), getAllMembers);
router.get("/:id", getMemberById);
router.put("/:id", authorize("admin"), validate(updateMemberSchema), updateMember);
router.patch("/:id/status", authorize("admin"), toggleMemberStatus);
router.get("/:id/attendance", getAttendance);
router.post("/:id/attendance", authorize("admin", "coach"), validate(attendanceSchema), logAttendance);

export default router;
