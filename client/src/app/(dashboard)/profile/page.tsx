"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, Lock, User as UserIcon, Phone, Sparkles, Trash2 } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshUser, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: "",
    sport: "",
    membershipType: "monthly",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deleteForm, setDeleteForm] = useState({
    currentPassword: "",
    confirmText: "",
  });

  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        const profile = res.data as User;
        setProfileForm({
          name: profile.name || "",
          sport: profile.sport || "",
          membershipType: profile.membershipType || "monthly",
          phone: profile.phone || "",
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");
    setError("");
    try {
      const payload: any = {
        name: profileForm.name,
        phone: profileForm.phone,
        sport: profileForm.sport,
      };

      if (user?.role === "member") {
        payload.membershipType = profileForm.membershipType;
      }

      const res = await api.put("/auth/me", payload);
      const updatedUser = res.data?.user;
      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      await refreshUser();
      setProfileMessage("Profile updated successfully.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage("");
    setError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match.");
      setPasswordSaving(false);
      return;
    }

    try {
      await api.put("/auth/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage("Password changed successfully.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDeleteSaving(true);
    setDeleteMessage("");
    setError("");

    if (deleteForm.confirmText !== "DELETE") {
      setError("Type DELETE to confirm account deletion.");
      setDeleteSaving(false);
      return;
    }

    try {
      await api.delete("/auth/me", {
        data: { currentPassword: deleteForm.currentPassword },
      });

      logout();
      setDeleteMessage("Account deleted successfully.");
      router.push("/register");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleteSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Topbar title="Profile Management" subtitle="Update your personal information" />
      <div className="p-8 space-y-6 max-w-3xl">
        <div className="glass-card p-6 border border-surface-800/60">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-50">{user?.name}</h2>
              <p className="text-sm text-surface-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <p className="text-sm text-surface-400">Manage your account details, password, and account lifecycle in one secure place.</p>
        </div>

        {error && <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">{error}</div>}
        {profileMessage && <div className="p-3 rounded-lg bg-success-500/10 border border-success-500/20 text-success-400 text-sm">{profileMessage}</div>}
        {passwordMessage && <div className="p-3 rounded-lg bg-success-500/10 border border-success-500/20 text-success-400 text-sm">{passwordMessage}</div>}
        {deleteMessage && <div className="p-3 rounded-lg bg-success-500/10 border border-success-500/20 text-success-400 text-sm">{deleteMessage}</div>}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleProfileSubmit}
          className="glass-card p-6 space-y-4"
        >
          <h3 className="text-base font-semibold text-surface-100">Edit Profile</h3>
          <div>
            <label htmlFor="profile-name" className="block text-xs font-medium text-surface-400 mb-1.5">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input id="profile-name" name="name" value={profileForm.name} onChange={handleProfileChange} className="input-field pl-10" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-sport" className="block text-xs font-medium text-surface-400 mb-1.5">Sport</label>
              <select id="profile-sport" name="sport" value={profileForm.sport} onChange={handleProfileChange} className="input-field">
                {['Cricket', 'Football', 'Badminton'].map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
            {user?.role === "member" && (
              <div>
                <label htmlFor="profile-membership" className="block text-xs font-medium text-surface-400 mb-1.5">Membership</label>
                <select id="profile-membership" name="membershipType" value={profileForm.membershipType} onChange={handleProfileChange} className="input-field">
                  {['monthly', 'annual', 'lifetime'].map((membership) => (
                    <option key={membership} value={membership} className="capitalize">{membership}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-xs font-medium text-surface-400 mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input id="profile-phone" name="phone" value={profileForm.phone} onChange={handleProfileChange} className="input-field pl-10" />
            </div>
          </div>

          <button type="submit" disabled={profileSaving} className="btn-primary flex items-center gap-2">
            {profileSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </motion.form>

        <motion.form
          id="security"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onSubmit={handlePasswordSubmit}
          className="glass-card p-6 space-y-4"
        >
          <h3 className="text-base font-semibold text-surface-100">Change Password</h3>

          <div>
            <label htmlFor="current-password" className="block text-xs font-medium text-surface-400 mb-1.5">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-password" className="block text-xs font-medium text-surface-400 mb-1.5">New Password</label>
              <input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="input-field"
                minLength={6}
                required
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-xs font-medium text-surface-400 mb-1.5">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="input-field"
                minLength={6}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={passwordSaving} className="btn-secondary flex items-center gap-2">
            {passwordSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </motion.form>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleDeleteAccount}
          className="glass-card p-6 space-y-4 border border-danger-500/30"
        >
          <h3 className="text-base font-semibold text-danger-300">Delete Account</h3>
          <p className="text-xs text-surface-400">This action is permanent. Enter your password and type DELETE to confirm.</p>

          <div>
            <label htmlFor="delete-password" className="block text-xs font-medium text-surface-400 mb-1.5">Current Password</label>
            <input
              id="delete-password"
              type="password"
              value={deleteForm.currentPassword}
              onChange={(e) => setDeleteForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="delete-confirm" className="block text-xs font-medium text-surface-400 mb-1.5">Type DELETE to confirm</label>
            <input
              id="delete-confirm"
              type="text"
              value={deleteForm.confirmText}
              onChange={(e) => setDeleteForm((prev) => ({ ...prev, confirmText: e.target.value }))}
              className="input-field"
              required
            />
          </div>

          <button type="submit" disabled={deleteSaving} className="btn-danger flex items-center gap-2">
            {deleteSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete My Account
          </button>
        </motion.form>
      </div>
    </div>
  );
}
