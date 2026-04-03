"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Lock, User as UserIcon, Phone, Sparkles } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    sport: "",
    membershipType: "monthly",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        const profile = res.data as User;
        setForm({
          name: profile.name || "",
          sport: profile.sport || "",
          membershipType: profile.membershipType || "monthly",
          phone: profile.phone || "",
          password: "",
        });
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = { ...form };
      if (!payload.password) {
        delete (payload as Partial<typeof payload>).password;
      }
      const res = await api.put("/auth/me", payload);
      const updatedUser = res.data?.user;
      if (updatedUser) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      await refreshUser();
      setMessage("Profile updated successfully.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
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
          <p className="text-sm text-surface-400">
            Members and coaches manage their own editable details here. Admins only manage account status from the members screen.
          </p>
        </div>

        {error && <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">{error}</div>}
        {message && <div className="p-3 rounded-lg bg-success-500/10 border border-success-500/20 text-success-400 text-sm">{message}</div>}

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 space-y-4"
        >
          <div>
            <label htmlFor="profile-name" className="block text-xs font-medium text-surface-400 mb-1.5">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input id="profile-name" name="name" value={form.name} onChange={handleChange} className="input-field pl-10" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-sport" className="block text-xs font-medium text-surface-400 mb-1.5">Sport</label>
              <select id="profile-sport" name="sport" value={form.sport} onChange={handleChange} className="input-field">
                {['Cricket', 'Football', 'Badminton'].map((sport) => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="profile-membership" className="block text-xs font-medium text-surface-400 mb-1.5">Membership</label>
              <select id="profile-membership" name="membershipType" value={form.membershipType} onChange={handleChange} className="input-field">
                {['monthly', 'annual', 'lifetime'].map((membership) => (
                  <option key={membership} value={membership} className="capitalize">{membership}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-xs font-medium text-surface-400 mb-1.5">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input id="profile-phone" name="phone" value={form.phone} onChange={handleChange} className="input-field pl-10" />
            </div>
          </div>

          <div>
            <label htmlFor="profile-password" className="block text-xs font-medium text-surface-400 mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input
                id="profile-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="Leave blank to keep current password"
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </motion.form>
      </div>
    </div>
  );
}
