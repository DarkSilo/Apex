import Notification from "../models/Notification";
import User from "../models/User";

interface NotificationPayload {
  type: "session_created" | "session_cancelled" | "session_deleted" | "session_rescheduled" | "payment_completed";
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export const createNotificationsForUsers = async (
  userIds: string[],
  payload: NotificationPayload,
  channels: Array<"in_app" | "email"> = ["in_app"]
): Promise<void> => {
  if (!userIds.length) {
    return;
  }

  const docs = userIds.flatMap((userId) =>
    channels.map((channel) => ({
      userId,
      channel,
      ...payload,
    }))
  );

  await Notification.insertMany(docs);
};

export const notifyMembersBySport = async (
  sport: string,
  payload: NotificationPayload,
  channels: Array<"in_app" | "email"> = ["in_app"]
): Promise<void> => {
  const members = await User.find({ role: "member", sport, status: "active" }).select("_id");
  const userIds = members.map((member) => String(member._id));
  await createNotificationsForUsers(userIds, payload, channels);
};

export const notifyAdmins = async (
  payload: NotificationPayload,
  channels: Array<"in_app" | "email"> = ["in_app"]
): Promise<void> => {
  const admins = await User.find({ role: "admin", status: "active" }).select("_id");
  const userIds = admins.map((admin) => String(admin._id));
  await createNotificationsForUsers(userIds, payload, channels);
};
