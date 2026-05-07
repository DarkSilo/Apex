"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, ChevronDown, UserCircle, KeyRound, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { NotificationItem } from "@/types";

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    const loadNotifications = async () => {
      try {
        const res = await api.get("/notifications/me");
        if (!isMounted) return;
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch {
        // Silent fail to avoid breaking topbar rendering.
      }
    };

    void loadNotifications();
    const interval = setInterval(() => {
      void loadNotifications();
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Ignore read errors for better UX continuity.
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/me/read-all");
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore read-all errors for better UX continuity.
    }
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push("/");
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
          <div className="relative" ref={notificationRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative p-2.5 rounded-xl bg-surface-800/50 border border-surface-700/50 text-surface-400 hover:text-surface-200 transition-colors"
              id="notifications-bell"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-brand-500 text-[10px] text-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl border border-surface-700 bg-surface-900/95 backdrop-blur-xl shadow-xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
                  <p className="text-sm font-semibold text-surface-100">Notifications</p>
                  <button onClick={handleMarkAllRead} className="text-xs text-brand-400 hover:text-brand-300">
                    Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-surface-500 text-center">No notifications yet</p>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => handleMarkRead(item._id)}
                        className={`w-full text-left px-4 py-3 border-b border-surface-800/70 hover:bg-surface-800/50 ${item.isRead ? "opacity-70" : ""}`}
                      >
                        <p className="text-xs font-semibold text-surface-200">{item.title}</p>
                        <p className="text-xs text-surface-400 mt-1">{item.message}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
                {user?.role !== "admin" && (
                  <>
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
                  </>
                )}
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
