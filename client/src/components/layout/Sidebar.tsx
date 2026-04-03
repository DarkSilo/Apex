"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Package,
  Calendar,
  DollarSign,
  BarChart3,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItemsByRole = {
  admin: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/members", label: "Members", icon: Users },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/sessions", label: "Sessions", icon: Calendar },
    { href: "/payments", label: "Payments", icon: DollarSign },
    { href: "/reports", label: "Reports", icon: BarChart3 },
  ],
  coach: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/members", label: "Members", icon: Users },
    { href: "/sessions", label: "Sessions", icon: Calendar },
    { href: "/inventory", label: "Inventory", icon: Package },
  ],
  member: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/sessions", label: "Sessions", icon: Calendar },
    { href: "/payments", label: "Payments", icon: DollarSign },
  ],
} as const;

const roleMeta = {
  admin: { title: "Administrator Console", subtitle: "Full operational control", badge: "bg-brand-500/20 text-brand-300" },
  coach: { title: "Coach Workspace", subtitle: "Training and roster management", badge: "bg-success-500/20 text-success-300" },
  member: { title: "Member Portal", subtitle: "Your sessions and payments", badge: "bg-warning-500/20 text-warning-300" },
} as const;

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role ?? "member";
  const navItems = navItemsByRole[role];
  const meta = roleMeta[role];

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-surface-800 bg-surface-950/95 backdrop-blur-xl md:flex">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-surface-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-surface-50 tracking-tight">APEX</h1>
          <p className="text-[10px] text-surface-500 uppercase tracking-widest">Sports Club</p>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className={`rounded-2xl border border-surface-800 px-4 py-3 ${meta.badge}`}>
          <p className="text-sm font-semibold">{meta.title}</p>
          <p className="text-xs opacity-80 mt-0.5">{meta.subtitle}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          // Filter nav based on role
          if (user?.role === "member" && (item.href === "/reports")) return null;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`sidebar-link ${isActive ? "active" : ""}`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-400"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-surface-800">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500/30 to-brand-700/30 border border-brand-500/20 flex items-center justify-center text-sm font-semibold text-brand-400">
            {user?.name?.charAt(0) || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-200 truncate">{user?.name}</p>
            <p className="text-xs text-surface-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-link w-full text-danger-400 hover:bg-danger-500/10 hover:text-danger-400"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
