import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

const generateTokens = (user: any) => {
  const payload = { id: user._id, role: user.role, email: user.email };
  const accessExpiresIn = (process.env.JWT_EXPIRES_IN || "1d") as jwt.SignOptions["expiresIn"];
  const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: accessExpiresIn }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret",
    { expiresIn: refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, sport, membershipType, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "member",
      sport,
      membershipType: membershipType || "monthly",
      phone,
    });

    const tokens = generateTokens(user);

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sport: user.sport,
        status: user.status,
      },
      ...tokens,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    if (user.status === "inactive") {
      res.status(403).json({ message: "Account is deactivated. Contact admin." });
      return;
    }

    const tokens = generateTokens(user);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sport: user.sport,
        status: user.status,
      },
      ...tokens,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ message: "Refresh token is required" });
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret"
    ) as any;

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const tokens = generateTokens(user);
    res.json({ ...tokens });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Invalid refresh token";
    res.status(401).json({ message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const updates: any = {
      name: req.body.name,
      phone: req.body.phone,
      sport: req.body.sport,
      membershipType: req.body.membershipType,
    };

    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) delete updates[key];
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "Profile updated successfully", user });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

export const changeMyPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
      res.status(400).json({ message: "Current password is incorrect." });
      return;
    }

    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      res.status(400).json({ message: "New password must be different from current password." });
      return;
    }

    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to change password", error: error.message });
  }
};

export const deleteMyAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const { currentPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
      res.status(400).json({ message: "Current password is incorrect." });
      return;
    }

    if (user.role === "admin") {
      const activeAdminCount = await User.countDocuments({ role: "admin", status: "active" });
      if (activeAdminCount <= 1) {
        res.status(400).json({ message: "Cannot delete the last active admin account." });
        return;
      }
    }

    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete account", error: error.message });
  }
};
