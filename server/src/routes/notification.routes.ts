import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notification.controller";

const router = Router();

router.use(authenticate);

router.get("/me", getMyNotifications);
router.patch("/me/read-all", markAllNotificationsRead);
router.patch("/:id/read", markNotificationRead);

export default router;
