"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  ClipboardList,
  UserCheck,
  CreditCard,
  Sparkles,
} from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DashboardStats, InventoryItem, Session, Payment, User } from "@/types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useAuth } from "@/context/AuthContext";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const roleCopy = {
  admin: {
    title: "Administration Dashboard",
    subtitle: "Operational overview, finances, and club-wide activity",
    accent: "bg-brand-500",
  },
  coach: {
    title: "Coach Dashboard",
    subtitle: "Assigned sessions, roster visibility, and training readiness",
    accent: "bg-success-500",
  },
  member: {
    title: "Member Dashboard",
    subtitle: "Your training schedule, attendance, and payment history",
    accent: "bg-warning-500",
  },
} as const;

interface MetricCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

type DashboardMetric = MetricCardProps;

function MetricCard({ title, value, sub, icon: Icon, color, trend }: Readonly<MetricCardProps>) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.03, y: -2 }}
      className="metric-card group relative overflow-hidden"
    >
      <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color.replace("bg-", "text-")}`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-success-400 text-xs font-medium">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-surface-50 tracking-tight">{value}</p>
      <p className="text-sm font-medium text-surface-400 mt-1">{title}</p>
      {sub && <p className="text-xs text-surface-600 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 text-xs">
        <p className="text-surface-400 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={`${p.dataKey ?? p.name ?? p.value}`} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function SmallListCard({
  title,
  icon: Icon,
  children,
  action,
}: Readonly<{
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}>) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-surface-100 flex items-center gap-2">
          <Icon className="w-4 h-4 text-brand-400" />
          {title}
        </h3>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const role = user?.role ?? "member";
  const copy = roleCopy[role];
  const currentUserId = user?._id || user?.id;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{ month: string; revenue: number; payments: number }>>([]);
  const [myRoster, setMyRoster] = useState<User[]>([]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    sport: user?.sport || "Cricket",
    membershipType: user?.membershipType || "monthly",
  });
  const [loading, setLoading] = useState(true);

  const attendanceCount = user?.attendance?.length ?? 0;
  const latestPayment = recentPayments[0];
  const latestPaymentValue = latestPayment ? formatCurrency(latestPayment.amount) : "—";

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      phone: user?.phone || "",
      sport: user?.sport || "Cricket",
      membershipType: user?.membershipType || "monthly",
    });
  }, [user?.name, user?.phone, user?.sport, user?.membershipType]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        if (role === "admin") {
          const [statsRes, alertsRes, sessionsRes, paymentsRes, reportRes] = await Promise.all([
            api.get("/members/stats"),
            api.get("/inventory/alerts"),
            api.get("/sessions?status=scheduled"),
            api.get("/payments"),
            api.get("/payments/report"),
          ]);

          if (cancelled) return;

          setStats(statsRes.data);
          setLowStock((alertsRes.data.items || []).slice(0, 4).map((item: any) => ({ ...item, _id: item._id || item.id })));
          setUpcomingSessions(sessionsRes.data?.slice(0, 4) || []);
          setRecentPayments(paymentsRes.data?.slice(0, 5) || []);

          const breakdown = reportRes.data?.monthlyBreakdown || [];
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          setMonthlyRevenue(
            breakdown.map((b: any) => ({
              month: monthNames[b._id - 1],
              revenue: b.revenue,
              payments: b.count,
            }))
          );
        } else if (role === "coach") {
          const [statsRes, sessionsRes, rosterRes, alertsRes] = await Promise.all([
            api.get("/members/stats"),
            api.get(`/sessions?coachId=${currentUserId}&status=scheduled`),
            api.get(`/members?role=member&sport=${encodeURIComponent(user.sport)}&limit=100`),
            api.get("/inventory/alerts"),
          ]);

          if (cancelled) return;

          setStats(statsRes.data);
          setUpcomingSessions(sessionsRes.data?.slice(0, 4) || []);
          setMyRoster(rosterRes.data.members?.slice(0, 5) || []);
          setLowStock((alertsRes.data.items || []).slice(0, 4).map((item: any) => ({ ...item, _id: item._id || item.id })));
          setRecentPayments([]);
          setMonthlyRevenue([]);
        } else {
          const [statsRes, sessionsRes, paymentsRes] = await Promise.all([
            api.get("/members/stats"),
            api.get(`/sessions?status=scheduled&sport=${encodeURIComponent(user.sport)}`),
            api.get(`/payments?memberId=${currentUserId}`),
          ]);

          if (cancelled) return;

          setStats(statsRes.data);
          setUpcomingSessions(sessionsRes.data?.slice(0, 4) || []);
          setRecentPayments(paymentsRes.data?.slice(0, 5) || []);
          setLowStock([]);
          setMonthlyRevenue([]);
          setMyRoster([]);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [user, role, currentUserId]);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage("");
    try {
      const payload: any = {
        name: profileForm.name,
        phone: profileForm.phone,
        sport: profileForm.sport,
      };
      if (role === "member") {
        payload.membershipType = profileForm.membershipType;
      }
      await api.put("/auth/me", payload);
      await refreshUser();
      setProfileMessage("Profile updated successfully.");
    } catch (error: any) {
      setProfileMessage(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const adminMetrics: DashboardMetric[] = [
    {
      title: "Total Members",
      value: stats?.totalMembers ?? "—",
      sub: `${stats?.activeMembers ?? 0} active`,
      icon: Users,
      color: "bg-brand-500",
      trend: "+12%",
    },
    {
      title: "Active Coaches",
      value: stats?.coaches ?? "—",
      sub: "Available staff",
      icon: Activity,
      color: "bg-success-500",
      trend: "+2",
    },
    {
      title: "Monthly Revenue",
      value: monthlyRevenue.length
        ? formatCurrency(monthlyRevenue.at(-1)?.revenue ?? 0)
        : "—",
      sub: "Current month",
      icon: DollarSign,
      color: "bg-warning-500",
      trend: "+8%",
    },
    {
      title: "Upcoming Sessions",
      value: upcomingSessions.length,
      sub: "Scheduled training",
      icon: Calendar,
      color: "bg-brand-600",
    },
  ];

  const coachMetrics: DashboardMetric[] = [
    {
      title: "My Scheduled Sessions",
      value: upcomingSessions.length,
      sub: "Assigned to me",
      icon: Calendar,
      color: "bg-success-500",
    },
    {
      title: "Sport Roster",
      value: myRoster.length,
      sub: `${user?.sport || "Club"} members`,
      icon: UserCheck,
      color: "bg-brand-500",
    },
    {
      title: "Active Members",
      value: stats?.activeMembers ?? "—",
      sub: "Club-wide active participants",
      icon: Users,
      color: "bg-warning-500",
    },
    {
      title: "Low Stock Items",
      value: lowStock.length,
      sub: "Equipment to monitor",
      icon: AlertTriangle,
      color: "bg-danger-500",
    },
  ];

  const memberMetrics: DashboardMetric[] = [
    {
      title: "Membership Type",
      value: user?.membershipType ?? "—",
      sub: `${user?.sport || "Selected sport"}`,
      icon: ShieldCheck,
      color: "bg-brand-500",
    },
    {
      title: "Attendance Records",
      value: attendanceCount,
      sub: "Historical check-ins",
      icon: ClipboardList,
      color: "bg-success-500",
    },
    {
      title: "Upcoming Sessions",
      value: upcomingSessions.length,
      sub: "Scheduled for your sport",
      icon: Calendar,
      color: "bg-warning-500",
    },
    {
      title: "Latest Payment",
      value: latestPaymentValue,
      sub: latestPayment ? latestPayment.status : "No payments yet",
      icon: CreditCard,
      color: "bg-brand-600",
    },
  ];

  let activeMetrics: DashboardMetric[] = memberMetrics;
  if (role === "admin") {
    activeMetrics = adminMetrics;
  } else if (role === "coach") {
    activeMetrics = coachMetrics;
  }

  const membershipSummary = useMemo(
    () => [
      { label: "Role", value: role },
      { label: "Sport", value: user?.sport || "—" },
      { label: "Status", value: user?.status || "—" },
      { label: "Attendance", value: attendanceCount },
    ],
    [attendanceCount, role, user?.sport, user?.status]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Topbar title={copy.title} subtitle={copy.subtitle} />
      <div className="p-8 space-y-8">
        <div className="glass-card p-6 border border-surface-800/60">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white ${copy.accent}`}>
                <Sparkles className="h-3.5 w-3.5" />
                {role.toUpperCase()} VIEW
              </div>
              <h2 className="mt-4 text-2xl font-bold text-surface-50">{copy.title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-surface-400">{copy.subtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {membershipSummary.map((item) => (
                <div key={item.label} className="rounded-2xl border border-surface-800 bg-surface-900/60 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-surface-500">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-surface-100 capitalize">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {activeMetrics.map((m) => (
            <MetricCard key={m.title} {...m} />
          ))}
        </motion.div>

        {role === "admin" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 lg:col-span-2"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-surface-100">Revenue Overview</h3>
                    <p className="text-xs text-surface-500 mt-0.5">Monthly income this year</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-brand-400" />
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={monthlyRevenue}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue (LKR)" stroke="#3b82f6" fill="url(#revenueGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-surface-100">Members by Sport</h3>
                    <p className="text-xs text-surface-500 mt-0.5">Distribution</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats?.sportBreakdown?.map((s) => ({ name: s._id, count: s.count })) || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Members" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-surface-100">Upcoming Sessions</h3>
                  <a href="/sessions" className="text-xs text-brand-400 hover:text-brand-300">View all →</a>
                </div>
                <div className="space-y-3">
                  {upcomingSessions.length === 0 && <p className="text-sm text-surface-500">No upcoming sessions</p>}
                  {upcomingSessions.map((s) => (
                    <div key={s._id} className="flex items-start gap-3 rounded-lg border border-surface-700/30 bg-surface-800/50 p-3">
                      <div className="rounded-lg bg-brand-500/10 p-2">
                        <Calendar className="w-4 h-4 text-brand-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-surface-200">{s.eventName}</p>
                        <p className="text-xs text-surface-500">{formatDate(s.date)} · {s.startTime}</p>
                        <p className="truncate text-xs text-surface-600">{s.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-surface-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning-400" />
                    Low Stock Alerts
                  </h3>
                  <a href="/inventory" className="text-xs text-brand-400 hover:text-brand-300">View all →</a>
                </div>
                <div className="space-y-3">
                  {lowStock.length === 0 && <p className="text-sm text-success-400">All stock levels OK ✓</p>}
                  {lowStock.map((item) => (
                    <div key={item._id || (item as any).id} className="flex items-center justify-between rounded-lg border border-warning-500/20 bg-warning-500/5 p-3">
                      <div className="flex items-center gap-3">
                        <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                          <AlertTriangle className="w-4 h-4 text-warning-400" />
                        </motion.div>
                        <div>
                          <p className="text-sm font-medium text-surface-200">{item.itemName}</p>
                          <p className="text-xs text-surface-500">{item.sport}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-warning-400">{item.currentStock}</p>
                        <p className="text-xs text-surface-600">/ {item.minThreshold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-surface-100">Recent Payments</h3>
                  <a href="/payments" className="text-xs text-brand-400 hover:text-brand-300">View all →</a>
                </div>
                <div className="space-y-3">
                  {recentPayments.length === 0 && <p className="text-sm text-surface-500">No payment records</p>}
                  {recentPayments.map((p) => {
                    const member = p.memberId as User;
                    return (
                      <div key={p._id} className="flex items-center justify-between rounded-lg border border-surface-700/30 bg-surface-800/50 p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-success-500/20 bg-success-500/10 text-xs font-bold text-success-400">
                            {(member?.name || "?")[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-surface-200">{member?.name || "Unknown"}</p>
                            <p className="text-xs text-surface-500">{formatDate(p.date)}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-success-400">{formatCurrency(p.amount)}</p>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </>
        )}

        {role === "coach" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SmallListCard
              title="My Scheduled Sessions"
              icon={Calendar}
              action={<a href="/sessions" className="text-xs text-brand-400 hover:text-brand-300">Open sessions →</a>}
            >
              {upcomingSessions.length === 0 && <p className="text-sm text-surface-500">No sessions assigned yet</p>}
              {upcomingSessions.map((s) => (
                <div key={s._id} className="rounded-lg border border-surface-700/30 bg-surface-800/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-surface-100">{s.eventName}</p>
                      <p className="text-xs text-surface-500">{formatDate(s.date)} · {s.startTime} - {s.endTime}</p>
                    </div>
                    <span className="badge badge-info">{s.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-surface-400">{s.location}</p>
                </div>
              ))}
            </SmallListCard>

            <SmallListCard
              title="Sport Roster"
              icon={UserCheck}
              action={<span className="text-xs text-surface-500">{user?.sport || "Club"} members</span>}
            >
              {myRoster.length === 0 && <p className="text-sm text-surface-500">No roster members found</p>}
              {myRoster.map((member) => (
                <div key={member._id} className="flex items-center justify-between rounded-lg border border-surface-700/30 bg-surface-800/50 p-4">
                  <div>
                    <p className="font-medium text-surface-100">{member.name}</p>
                    <p className="text-xs text-surface-500">{member.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-surface-400 capitalize">{member.membershipType}</p>
                    <p className="text-xs text-success-400 capitalize">{member.status}</p>
                  </div>
                </div>
              ))}
            </SmallListCard>

            <SmallListCard title="Equipment Alerts" icon={AlertTriangle}>
              {lowStock.length === 0 && <p className="text-sm text-success-400">No equipment issues detected</p>}
              {lowStock.map((item) => (
                <div key={item._id} className="flex items-center justify-between rounded-lg border border-warning-500/20 bg-warning-500/5 p-4">
                  <div>
                    <p className="font-medium text-surface-100">{item.itemName}</p>
                    <p className="text-xs text-surface-500">{item.sport}</p>
                  </div>
                  <p className="text-sm font-semibold text-warning-400">{item.currentStock}/{item.minThreshold}</p>
                </div>
              ))}
            </SmallListCard>

            <SmallListCard title="Training Notes" icon={ClipboardList}>
              <div className="rounded-lg border border-surface-700/30 bg-surface-800/50 p-4 text-sm text-surface-300">
                Use the sessions view to manage schedule conflicts, update training plans, and keep your roster aligned with the club calendar.
              </div>
            </SmallListCard>
          </div>
        )}

        {role === "member" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <SmallListCard
              title="My Upcoming Sessions"
              icon={Calendar}
              action={<a href="/sessions" className="text-xs text-brand-400 hover:text-brand-300">View schedule →</a>}
            >
              {upcomingSessions.length === 0 && <p className="text-sm text-surface-500">No upcoming sessions for your sport</p>}
              {upcomingSessions.map((s) => (
                <div key={s._id} className="rounded-lg border border-surface-700/30 bg-surface-800/50 p-4">
                  <p className="font-medium text-surface-100">{s.eventName}</p>
                  <p className="text-xs text-surface-500">{formatDate(s.date)} · {s.startTime} - {s.endTime}</p>
                  <p className="text-xs text-surface-400">{s.location}</p>
                </div>
              ))}
            </SmallListCard>

            <SmallListCard title="Attendance History" icon={ClipboardList}>
              {attendanceCount === 0 && <p className="text-sm text-surface-500">No attendance records yet</p>}
              {(user?.attendance || []).slice(-5).reverse().map((record) => (
                <div key={`${record.sessionId}-${record.date}`} className="flex items-center justify-between rounded-lg border border-surface-700/30 bg-surface-800/50 p-4">
                  <div>
                    <p className="font-medium text-surface-100">Attendance marked</p>
                    <p className="text-xs text-surface-500">{formatDate(record.date)}</p>
                  </div>
                  <span className="badge badge-success">Present</span>
                </div>
              ))}
            </SmallListCard>

            <SmallListCard title="Recent Payments" icon={CreditCard}>
              {recentPayments.length === 0 && <p className="text-sm text-surface-500">No payment history found</p>}
              {recentPayments.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between rounded-lg border border-surface-700/30 bg-surface-800/50 p-4">
                  <div>
                    <p className="font-medium text-surface-100">{payment.receiptNumber}</p>
                    <p className="text-xs text-surface-500">{formatDate(payment.date)} · {payment.method.replace("_", " ")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success-400">{formatCurrency(payment.amount)}</p>
                    <p className="text-xs text-surface-400 capitalize">{payment.status}</p>
                  </div>
                </div>
              ))}
            </SmallListCard>
          </div>
        )}

        {(role === "coach" || role === "member") && (
          <div className="glass-card p-6">
            <h3 className="font-semibold text-surface-100 mb-4">Profile Management</h3>
            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-name" className="block text-xs text-surface-400 mb-1.5">Name</label>
                <input
                  id="profile-name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label htmlFor="profile-phone" className="block text-xs text-surface-400 mb-1.5">Phone</label>
                <input
                  id="profile-phone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="profile-sport" className="block text-xs text-surface-400 mb-1.5">Sport</label>
                <select
                  id="profile-sport"
                  value={profileForm.sport}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, sport: e.target.value }))}
                  className="input-field"
                >
                  {["Cricket", "Football", "Badminton"].map((sport) => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>
              {role === "member" && (
                <div>
                  <label htmlFor="profile-membership" className="block text-xs text-surface-400 mb-1.5">Membership Type</label>
                  <select
                    id="profile-membership"
                    value={profileForm.membershipType}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        membershipType: e.target.value as "monthly" | "annual" | "lifetime",
                      }))
                    }
                    className="input-field"
                  >
                    {["monthly", "annual", "lifetime"].map((type) => (
                      <option key={type} value={type} className="capitalize">{type}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="md:col-span-2 flex items-center gap-3">
                <button type="submit" className="btn-primary" disabled={profileSaving}>
                  {profileSaving ? "Saving..." : "Save Profile"}
                </button>
                {profileMessage && <p className="text-xs text-surface-400">{profileMessage}</p>}
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
