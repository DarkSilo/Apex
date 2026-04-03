import { Request, Response } from "express";
import Session from "../models/Session";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

const checkConflict = async (
  coachId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string
) => {
  const query: any = {
    coachId,
    date: new Date(date),
    status: { $ne: "cancelled" },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Session.findOne(query);
};

export const getAllSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, sport, status, coachId, startDate, endDate } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { eventName: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (sport) query.sport = sport;
    if (status) query.status = status;
    if (coachId) query.coachId = coachId;

    if (req.user?.role === "coach") {
      query.coachId = req.user.id;
    }

    if (req.user?.role === "member") {
      const member = await User.findById(req.user.id).select("sport");
      if (!member) {
        res.status(404).json({ message: "Member not found" });
        return;
      }
      query.sport = member.sport;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }

    const sessions = await Session.find(query)
      .populate("coachId", "name email sport")
      .sort({ date: 1, startTime: 1 });

    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch sessions", error: error.message });
  }
};

export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payload = { ...req.body };

    if (req.user?.role === "coach") {
      payload.coachId = req.user.id;
    }

    const { coachId, date, startTime, endTime } = payload;

    const conflict = await checkConflict(coachId, date, startTime, endTime);
    if (conflict) {
      res.status(409).json({
        message: "Schedule conflict detected",
        conflict: {
          eventName: conflict.eventName,
          date: conflict.date,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
          location: conflict.location,
        },
      });
      return;
    }

    const session = await Session.create(payload);
    const populated = await session.populate("coachId", "name email sport");

    res.status(201).json({ message: "Session created successfully", session: populated });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create session", error: error.message });
  }
};

export const updateSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payload = { ...req.body };
    const sessionId = String(req.params.id);

    const existing = await Session.findById(sessionId).select("coachId");
    if (!existing) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    if (req.user?.role === "coach" && existing.coachId.toString() !== req.user.id) {
      res.status(403).json({ message: "Coaches can only manage their own sessions." });
      return;
    }

    if (req.user?.role === "coach") {
      payload.coachId = req.user.id;
    }

    const { coachId, date, startTime, endTime } = payload;

    if (coachId && date && startTime && endTime) {
      const conflict = await checkConflict(coachId, date, startTime, endTime, sessionId);
      if (conflict) {
        res.status(409).json({
          message: "Schedule conflict detected",
          conflict: {
            eventName: conflict.eventName,
            date: conflict.date,
            startTime: conflict.startTime,
            endTime: conflict.endTime,
          },
        });
        return;
      }
    }

    const session = await Session.findByIdAndUpdate(
      sessionId,
      { $set: payload },
      { new: true, runValidators: true }
    ).populate("coachId", "name email sport");

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    res.json({ message: "Session updated successfully", session });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update session", error: error.message });
  }
};

export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }
    res.json({ message: "Session deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete session", error: error.message });
  }
};

export const cancelSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role === "coach") {
      const existing = await Session.findById(req.params.id).select("coachId");
      if (!existing) {
        res.status(404).json({ message: "Session not found" });
        return;
      }
      if (existing.coachId.toString() !== req.user.id) {
        res.status(403).json({ message: "Coaches can only manage their own sessions." });
        return;
      }
    }

    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!session) {
      res.status(404).json({ message: "Session not found" });
      return;
    }

    res.json({ message: "Session cancelled successfully", session });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to cancel session", error: error.message });
  }
};
