"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, ChevronDown, UserCircle, KeyRound, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
      <div className="flex items-center justify-between px-4 py-4 md:px-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="page-header"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-surface-500 mt-0.5"
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
            <input
              type="text"
              placeholder="Search..."
              className="input-field pl-10 w-64 py-2 text-sm"
              id="global-search"
            />
          </div>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors"
            id="notifications-bell"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-500 rounded-full" />
          </motion.button>

          {/* User account dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-surface-800/30 border border-surface-700/30 hover:bg-surface-800/50 transition-colors"
              id="topbar-account-menu"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-sm font-bold text-white">
                {user?.name?.charAt(0) || "?"}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-surface-200">{user?.name}</p>
                <p className="text-[11px] text-surface-500 capitalize">{user?.role}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-surface-500 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-surface-700 bg-surface-900/95 backdrop-blur-xl shadow-xl overflow-hidden z-50">
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-surface-200 hover:bg-surface-800 transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-brand-400" />
                  Profile Management
                </Link>
                <Link
                  href="/profile#security"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-surface-200 hover:bg-surface-800 transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-warning-400" />
                  Change Password
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-danger-400 hover:bg-danger-500/10 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
