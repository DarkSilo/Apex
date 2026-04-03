import { Request, Response } from "express";
import User from "../models/User";
import Session from "../models/Session";
import { AuthRequest } from "../middleware/auth";

export const getAllMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, role, status, sport, page = "1", limit = "20" } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;
    if (sport) query.sport = sport;

    if (req.user?.role === "coach") {
      const coach = await User.findById(req.user.id).select("sport");
      if (!coach) {
        res.status(404).json({ message: "Coach not found" });
        return;
      }
      query.role = "member";
      query.sport = coach.sport;
    }

    const pageNum = Number.parseInt(page as string, 10);
    const limitNum = Number.parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [members, total] = await Promise.all([
      User.find(query).select("-password").skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    res.json({
      members,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch members", error: error.message });
  }
};

export const getMemberById = async (req: Request, res: Response): Promise<void> => {
  try {
    const member = await User.findById(req.params.id).select("-password");
    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }
    res.json(member);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch member", error: error.message });
  }
};

export const updateMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const allowedKeys = new Set(["status"]);
    const updateKeys = Object.keys(req.body || {});
    const hasInvalidKey = updateKeys.some((key) => !allowedKeys.has(key));
    if (hasInvalidKey) {
      res.status(403).json({
        message: "Admins can only manage active/inactive status from member management.",
      });
      return;
    }

    const member = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password");

    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    res.json({ message: "Member updated successfully", member });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update member", error: error.message });
  }
};

export const toggleMemberStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const member = await User.findById(req.params.id);
    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    member.status = member.status === "active" ? "inactive" : "active";
    await member.save();

    res.json({
      message: `Member ${member.status === "active" ? "activated" : "deactivated"} successfully`,
      status: member.status,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

export const getAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const member = await User.findById(req.params.id)
      .select("attendance name")
      .populate("attendance.sessionId", "eventName date location");

    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    res.json({ name: member.name, attendance: member.attendance });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch attendance", error: error.message });
  }
};

export const logAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, sessionId } = req.body;
    const member = await User.findById(req.params.id);

    if (!member) {
      res.status(404).json({ message: "Member not found" });
      return;
    }

    if (req.user?.role === "coach") {
      if (!sessionId) {
        res.status(400).json({ message: "Session is required for coach attendance logging." });
        return;
      }

      const coach = await User.findById(req.user.id).select("sport");
      if (!coach) {
        res.status(404).json({ message: "Coach not found" });
        return;
      }

      if (member.role !== "member" || member.sport !== coach.sport) {
        res.status(403).json({
          message: "Coaches can only log attendance for members in their own sport.",
        });
        return;
      }

      const assignedSession = await Session.findOne({
        _id: sessionId,
        coachId: req.user.id,
        sport: coach.sport,
      }).select("_id");

      if (!assignedSession) {
        res.status(403).json({
          message: "You can only log attendance for your assigned sessions.",
        });
        return;
      }
    }

    member.attendance.push({
      date: date ? new Date(date) : new Date(),
      sessionId,
    });

    await member.save();
    res.json({ message: "Attendance logged successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to log attendance", error: error.message });
  }
};

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalMembers, activeMembers, coaches, sportCounts] = await Promise.all([
      User.countDocuments({ role: "member" }),
      User.countDocuments({ role: "member", status: "active" }),
      User.countDocuments({ role: "coach" }),
      User.aggregate([
        { $match: { role: "member" } },
        { $group: { _id: "$sport", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      totalMembers,
      activeMembers,
      inactiveMembers: totalMembers - activeMembers,
      coaches,
      sportBreakdown: sportCounts,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch stats", error: error.message });
  }
};
