"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Calendar,
  DollarSign,
  BarChart3,
  Menu,
  X,
  LogOut,
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
  admin: { title: "Administrator Console", subtitle: "Full operational control" },
  coach: { title: "Coach Workspace", subtitle: "Training and roster management" },
  member: { title: "Member Portal", subtitle: "Your sessions and payments" },
} as const;

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const role = user?.role ?? "member";
  const visibleItems = navItemsByRole[role];
  const meta = roleMeta[role];

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-surface-800 bg-surface-950/95 px-4 py-3 backdrop-blur-xl">
        <div>
          <h1 className="text-base font-semibold text-surface-100">APEX</h1>
          <p className="text-[11px] text-surface-500">Sports Club</p>
        </div>
        <button
          type="button"
          className="rounded-lg border border-surface-700 bg-surface-800 p-2 text-surface-300"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-label="Close navigation overlay"
          />
          <aside className="relative h-full w-72 bg-surface-950 border-r border-surface-800 p-4">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-surface-100">{meta.title}</h2>
                <p className="text-xs text-surface-500">{meta.subtitle}</p>
                <p className="text-[11px] text-surface-600 mt-1">{user?.name}</p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-surface-700 bg-surface-800 p-2 text-surface-300"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`sidebar-link ${active ? "active" : ""}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-surface-800 pt-4">
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="sidebar-link w-full text-danger-400 hover:bg-danger-500/10 hover:text-danger-400"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
