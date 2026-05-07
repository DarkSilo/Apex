import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import Notification from "../models/Notification";

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const notifications = await Notification.find({ userId, channel: "in_app" })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId, isRead: false, channel: "in_app" });

    res.json({ notifications, unreadCount });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    res.json({ message: "Notification marked as read", notification });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update notification", error: error.message });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });

    res.json({ message: "All notifications marked as read" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update notifications", error: error.message });
  }
};
