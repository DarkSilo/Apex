import { Router } from "express";
import {
  getAllSessions,
  createSession,
  updateSession,
  deleteSession,
  cancelSession,
} from "../controllers/session.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import { sessionSchema, updateSessionSchema } from "../validators/session.validator";

const router = Router();

router.use(authenticate);

router.get("/", getAllSessions);
router.post("/", authorize("admin", "coach"), validate(sessionSchema), createSession);
router.put("/:id", authorize("admin", "coach"), validate(updateSessionSchema), updateSession);
router.delete("/:id", authorize("admin"), deleteSession);
router.patch("/:id/cancel", authorize("admin", "coach"), cancelSession);

export default router;
