"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import PublicNavbar from "@/components/layout/PublicNavbar";

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    sport: "Cricket",
    membershipType: "monthly",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors((prev) => {
      const clone = { ...prev };
      delete clone[e.target.name];
      return clone;
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!emailRegex.test(formData.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = "Phone number must contain 10-15 digits.";
    }
    if (!passwordRegex.test(formData.password)) {
      errors.password = "Use at least 8 chars with upper, lower, number, and symbol.";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      setError("Please fix validation errors before continuing.");
      return;
    }

    setLoading(true);
    try {
      const { ...data } = formData;
      await register(data);
      router.push("/dashboard");
    } catch (err: any) {
      const apiErrors = err.response?.data?.errors as Array<{ field: string; message: string }> | undefined;
      if (apiErrors?.length) {
        const mapped: Record<string, string> = {};
        apiErrors.forEach((item) => {
          mapped[item.field] = item.message;
        });
        setFieldErrors(mapped);
      }
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950">
      <PublicNavbar />
      <div className="flex items-center justify-center px-4 py-20 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-700/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl shadow-brand-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-50 tracking-tight">APEX</h1>
            <p className="text-xs text-surface-500 uppercase tracking-widest">Sports Club</p>
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-surface-100">Create Account</h2>
            <p className="text-sm text-surface-500 mt-1">Join the sports club community</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="John Doe"
                  required
                  id="register-name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="you@email.com"
                  required
                  id="register-email"
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-danger-400 mt-1.5">{fieldErrors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Sport</label>
                <select
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  className="input-field"
                  id="register-sport"
                >
                  <option value="Cricket">Cricket</option>
                  <option value="Football">Football</option>
                  <option value="Badminton">Badminton</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Membership</label>
                <select
                  name="membershipType"
                  value={formData.membershipType}
                  onChange={handleChange}
                  className="input-field"
                  id="register-membership"
                >
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="+94 77 123 4567"
                  id="register-phone"
                />
              </div>
              {fieldErrors.phone && <p className="text-xs text-danger-400 mt-1.5">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-11 pr-11"
                  placeholder="Min 8 chars, upper/lower, number, symbol"
                  required
                  minLength={8}
                  id="register-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-surface-500 mt-1.5 leading-relaxed">Password must include uppercase, lowercase, number, and symbol.</p>
              {fieldErrors.password && <p className="text-xs text-danger-400 mt-1.5">{fieldErrors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="Repeat password"
                  required
                  minLength={6}
                  id="register-confirm-password"
                />
              </div>
              {fieldErrors.confirmPassword && <p className="text-xs text-danger-400 mt-1.5">{fieldErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              id="register-submit"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign In
            </a>
          </p>
        </div>
      </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <RegisterForm />;
}
