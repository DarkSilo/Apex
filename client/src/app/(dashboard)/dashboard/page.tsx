"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  Zap,
  ArrowRight
} from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DashboardStats, InventoryItem, Session, Payment, User } from "@/types";
import MeshBackground from "@/components/ui/MeshBackground";
import SpotlightCard from "@/components/ui/SpotlightCard";

interface DashboardMetric {
  title: string;
  value: string | number;
  sub: string;
  icon: any;
  color: string;
  trend?: string;
  trendUp?: boolean;
}
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
    gradient: "from-brand-500/20 via-brand-600/5 to-transparent",
    image: "/images/hero.png"
  },
  coach: {
    title: "Coach Dashboard",
    subtitle: "Assigned sessions, roster visibility, and training readiness",
    accent: "bg-success-500",
    gradient: "from-success-500/20 via-success-600/5 to-transparent",
    image: "/images/football.png" // Default for coach
  },
  member: {
    title: "Member Dashboard",
    subtitle: "Your training schedule, attendance, and payment history",
    accent: "bg-warning-500",
    gradient: "from-warning-500/20 via-warning-600/5 to-transparent",
    image: "/images/cricket.png" // Default for member
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

function MetricCard({ title, value, sub, icon: Icon, color, trend }: Readonly<MetricCardProps>) {
  const iconColorClass = color.replace("bg-", "text-");
  
  // Map Tailwind classes to RGBA for the spotlight effect
  const glowMap: Record<string, string> = {
    "bg-brand-500": "rgba(59, 130, 246, 0.15)",
    "bg-success-500": "rgba(34, 197, 94, 0.15)",
    "bg-warning-500": "rgba(245, 158, 11, 0.15)",
    "bg-danger-500": "rgba(239, 68, 68, 0.15)",
    "bg-info-500": "rgba(6, 182, 212, 0.15)",
  };

  const glowColor = glowMap[color] || "rgba(59, 130, 246, 0.15)";
  
  return (
    <SpotlightCard className="metric-card h-full group" glowColor={glowColor}>
      <motion.div variants={itemVariants} className="relative z-10">
        <div className="flex items-start justify-between">
          <div className={`p-4 rounded-2xl ${color} bg-opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className={`w-7 h-7 ${iconColorClass}`} />
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-black text-success-400 bg-success-500/10 px-3 py-1 rounded-full border border-success-500/20">
              <TrendingUp className="w-3 h-3" /> {trend}
            </div>
          )}
        </div>
        <div className="mt-8">
          <h3 className="text-sm font-bold text-surface-400 uppercase tracking-[0.2em]">{title}</h3>
          <p className="text-4xl font-black text-white mt-3 tracking-tighter">{value}</p>
          {sub && <p className="text-sm text-surface-500 mt-2 font-medium">{sub}</p>}
        </div>
      </motion.div>
    </SpotlightCard>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-4 border-surface-700/50 shadow-2xl">
        <p className="text-surface-400 mb-2 font-bold text-[10px] uppercase tracking-widest">{label}</p>
        {payload.map((p: any) => (
          <p key={`${p.dataKey ?? p.name ?? p.value}`} style={{ color: p.color }} className="text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            {p.name}: {typeof p.value === 'number' && p.name.toLowerCase().includes('revenue') ? formatCurrency(p.value) : p.value}
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
    <motion.div variants={itemVariants} className="glass-card p-6 border-surface-800/40">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-surface-50 flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20">
            <Icon className="w-4 h-4 text-brand-400" />
          </div>
          {title}
        </h3>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role ?? "member";
  const copy = roleCopy[role];
  const currentUserId = user?._id || user?.id;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{ month: string; revenue: number; payments: number }>>([]);
  const [myRoster, setMyRoster] = useState<User[]>([]);
  const [dailyAttendance, setDailyAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const attendanceCount = user?.attendance?.length ?? 0;
  const latestPayment = recentPayments[0];
  const latestPaymentValue = latestPayment ? formatCurrency(latestPayment.amount) : "—";

  // Dynamic image based on sport
  const heroImage = useMemo(() => {
    if (role === 'admin') return "/images/hero.png";
    const sport = user?.sport?.toLowerCase() || "";
    if (sport.includes('cricket')) return "/images/cricket.png";
    if (sport.includes('football')) return "/images/football.png";
    if (sport.includes('badminton')) return "/images/badminton.png";
    return copy.image;
  }, [role, user?.sport, copy.image]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const fetchDashboard = async () => {
      setLoading(true);
      try {
        if (role === "admin") {
          const [statsRes, alertsRes, sessionsRes, paymentsRes, reportRes, attendanceRes] = await Promise.all([
            api.get("/members/stats"),
            api.get("/inventory/alerts"),
            api.get("/sessions?status=scheduled"),
            api.get("/payments"),
            api.get("/payments/report"),
            api.get("/members/attendance/today"),
          ]);

          if (cancelled) return;

          setStats(statsRes.data);
          setLowStock((alertsRes.data.items || []).slice(0, 4).map((item: any) => ({ ...item, _id: item._id || item.id })));
          setUpcomingSessions(sessionsRes.data?.slice(0, 4) || []);
          setRecentPayments(paymentsRes.data?.slice(0, 5) || []);
          const attendanceData = Array.isArray(attendanceRes.data)
            ? attendanceRes.data
            : Array.isArray(attendanceRes.data?.attendance)
            ? attendanceRes.data.attendance
            : [];
          setDailyAttendance(attendanceData);

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
          const [statsRes, sessionsRes, rosterRes, alertsRes, attendanceRes] = await Promise.all([
            api.get("/members/stats"),
            api.get(`/sessions?coachId=${currentUserId}&status=scheduled`),
            api.get(`/members?role=member${user.sport ? `&sport=${encodeURIComponent(user.sport)}` : ""}&limit=100`),
            api.get("/inventory/alerts"),
            api.get("/members/attendance/today"),
          ]);

          if (cancelled) return;

          setStats(statsRes.data);
          setUpcomingSessions(sessionsRes.data?.slice(0, 4) || []);
          setMyRoster(rosterRes.data.members?.slice(0, 5) || []);
          setLowStock((alertsRes.data.items || []).slice(0, 4).map((item: any) => ({ ...item, _id: item._id || item.id })));
          const attendanceData = Array.isArray(attendanceRes.data)
            ? attendanceRes.data
            : Array.isArray(attendanceRes.data?.attendance)
            ? attendanceRes.data.attendance
            : [];
          setDailyAttendance(attendanceData);
          setRecentPayments([]);
          setMonthlyRevenue([]);
        } else {
          const [statsRes, sessionsRes, paymentsRes] = await Promise.all([
            api.get("/members/stats"),
            api.get(`/sessions?status=scheduled${user.sport ? `&sport=${encodeURIComponent(user.sport)}` : ""}`),
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
      title: "Scheduled Sessions",
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
      title: "Stock Alerts",
      value: lowStock.length,
      sub: "Equipment to monitor",
      icon: AlertTriangle,
      color: "bg-danger-500",
    },
  ];

  const memberMetrics: DashboardMetric[] = [
    {
      title: "Membership Status",
      value: user?.status?.toUpperCase() ?? "—",
      sub: `${user?.membershipType || "standard"} plan`,
      icon: ShieldCheck,
      color: "bg-brand-500",
    },
    {
      title: "Attendance",
      value: attendanceCount,
      sub: "Check-ins recorded",
      icon: ClipboardList,
      color: "bg-success-500",
    },
    {
      title: "Sport Sessions",
      value: upcomingSessions.length,
      sub: `Upcoming ${user?.sport || 'sports'}`,
      icon: Calendar,
      color: "bg-warning-500",
    },
    {
      title: "Latest Payment",
      value: latestPaymentValue,
      sub: latestPayment ? latestPayment.status : "No record",
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
      { label: "ID", value: currentUserId?.toString().substring(18) || "—" },
    ],
    [currentUserId, role, user?.sport, user?.status]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-surface-500 font-medium animate-pulse">Initializing Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface-950 overflow-hidden">
      <MeshBackground />

      <Topbar title={copy.title} subtitle={copy.subtitle} />

      <main className="relative z-10 p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Premium Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-surface-800/60 bg-surface-900/40 backdrop-blur-md"
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${copy.gradient} z-0`} />
          
          <div className="relative z-10 grid lg:grid-cols-2 items-center">
            <div className="p-8 md:p-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-[10px] font-bold tracking-[0.2em] text-white ${copy.accent} shadow-lg shadow-current/10`}
              >
                <Zap className="h-3.5 w-3.5 fill-white" />
                {role.toUpperCase()} CONSOLE
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-4xl md:text-5xl font-black text-surface-50 tracking-tight leading-[1.1]"
              >
                Welcome back, <br/>
                <span className="text-brand-400">{user?.name?.split(' ')[0]}</span>.
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 max-w-md text-base text-surface-400 leading-relaxed font-medium"
              >
                {copy.subtitle}. Everything you need to manage your {user?.sport || 'club'} activity is right here.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {membershipSummary.map((item) => (
                  <div key={item.label} className="group">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-surface-500 font-bold mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-surface-100 capitalize group-hover:text-brand-400 transition-colors">{item.value}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="relative h-64 lg:h-full hidden lg:block overflow-hidden">
              <motion.img 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                src={heroImage} 
                alt="Dashboard Hero" 
                className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-900/80 via-surface-900/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-900/60 to-transparent" />
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {activeMetrics.map((m) => (
            <MetricCard key={m.title} {...m} />
          ))}
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left/Middle Column: Charts and Activity */}
          <div className="lg:col-span-2 space-y-8">
            
            {role === "admin" && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="glass-card p-8 border-surface-800/40 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                      <h3 className="text-xl font-bold text-surface-50 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-brand-400" />
                        Revenue Analytics
                      </h3>
                      <p className="text-xs text-surface-500 font-medium mt-1">Real-time financial performance overview</p>
                    </div>
                  </div>
                  
                  <div className="h-[280px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyRevenue}>
                        <defs>
                          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} 
                          axisLine={false} 
                          tickLine={false} 
                          dy={10}
                        />
                        <YAxis 
                          tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(value) => `${value/1000}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          name="Revenue" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          fill="url(#revenueGrad)" 
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SmallListCard title="Today's Attendance" icon={UserCheck}>
                    {dailyAttendance.length === 0 ? (
                      <div className="py-12 text-center">
                        <Activity className="w-8 h-8 text-surface-700 mx-auto mb-3" />
                        <p className="text-sm text-surface-500 font-medium">No check-ins yet today</p>
                      </div>
                    ) : (
                      dailyAttendance.map((record, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={record.memberId} 
                          className="flex items-center justify-between p-3 rounded-xl bg-surface-900/40 border border-surface-800/40 hover:border-brand-500/20 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-success-500/10 flex items-center justify-center text-success-400 font-bold text-xs">
                              {record.memberName?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-surface-100">{record.memberName}</p>
                              <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">{record.sport}</p>
                            </div>
                          </div>
                          <div className="badge badge-success !bg-success-500/10 !text-success-400 border-none px-2 py-0.5 text-[10px] font-bold">PRESENT</div>
                        </motion.div>
                      ))
                    )}
                  </SmallListCard>

                  <SmallListCard 
                    title="Recent Payments" 
                    icon={CreditCard}
                    action={<Link href="/payments" className="text-[10px] font-bold text-brand-400 hover:text-brand-300 uppercase tracking-widest flex items-center gap-1 group">All <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /></Link>}
                  >
                    {recentPayments.length === 0 ? (
                      <p className="text-sm text-surface-500 py-4 text-center">No transactions recorded</p>
                    ) : (
                      recentPayments.map((p, i) => {
                        const member = p.memberId as User;
                        return (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={p._id} 
                            className="flex items-center justify-between p-3 rounded-xl bg-surface-900/40 border border-surface-800/40 hover:border-success-500/20 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-success-500/10 flex items-center justify-center text-success-400 font-bold text-xs">
                                <DollarSign className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-surface-100">{member?.name}</p>
                                <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">{formatDate(p.date)}</p>
                              </div>
                            </div>
                            <p className="text-sm font-black text-success-400">{formatCurrency(p.amount)}</p>
                          </motion.div>
                        );
                      })
                    )}
                  </SmallListCard>
                </div>
              </>
            )}

            {role === "coach" && (
              <>
                <SmallListCard title="Live Attendance" icon={UserCheck}>
                  {dailyAttendance.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl bg-surface-900/40 border border-dashed border-surface-800">
                      <p className="text-sm text-surface-600 font-bold uppercase tracking-widest">No activity yet today</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dailyAttendance.map((record, i) => (
                        <div key={record.memberId} className="flex items-center justify-between p-4 rounded-2xl bg-surface-900/40 border border-surface-800/40 group hover:border-brand-500/30 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold text-sm">
                              {record.memberName?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-surface-100">{record.memberName}</p>
                              <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest">{record.sport}</p>
                            </div>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        </div>
                      ))}
                    </div>
                  )}
                </SmallListCard>

                <SmallListCard 
                  title="My Sport Roster" 
                  icon={Users}
                  action={<span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{user?.sport} Members</span>}
                >
                  {myRoster.length === 0 ? (
                    <p className="text-sm text-surface-500">No members in your roster</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myRoster.map((member, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          key={member._id} 
                          className="flex items-center justify-between p-4 rounded-2xl bg-surface-900/40 border border-surface-800/40 hover:border-brand-500/20 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-surface-400 font-bold">
                              {member.name?.[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-surface-100">{member.name}</p>
                              <p className="text-[10px] text-surface-600 font-bold uppercase tracking-widest">{member.membershipType}</p>
                            </div>
                          </div>
                          <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${member.status === 'active' ? 'bg-success-500/10 text-success-400' : 'bg-surface-800 text-surface-500'}`}>
                            {member.status}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </SmallListCard>
              </>
            )}

            {role === "member" && (
              <>
                <SmallListCard 
                  title="Payment History" 
                  icon={CreditCard}
                  action={<Link href="/payments" className="text-[10px] font-bold text-brand-400 hover:text-brand-300 uppercase tracking-widest flex items-center gap-1 group">All Payments <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /></Link>}
                >
                  {recentPayments.length === 0 ? (
                    <div className="py-12 text-center rounded-2xl bg-surface-900/40 border border-dashed border-surface-800">
                      <CreditCard className="w-10 h-10 text-surface-800 mx-auto mb-3" />
                      <p className="text-sm text-surface-600 font-bold uppercase tracking-widest">No payment history</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recentPayments.map((p, i) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={p._id} 
                          className="flex items-center justify-between p-4 rounded-2xl bg-surface-900/40 border border-surface-800/40 hover:border-success-500/20 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-success-500/10 flex items-center justify-center text-success-400 font-bold text-xs">
                              <DollarSign className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-surface-100">{p.receiptNumber?.split('-')[0]}</p>
                              <p className="text-[10px] text-surface-500 font-bold uppercase tracking-wider">{formatDate(p.date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-sm font-black text-success-400">{formatCurrency(p.amount)}</p>
                             <p className="text-[9px] text-surface-600 font-bold uppercase">{p.status}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </SmallListCard>

                <SmallListCard title="Training Performance" icon={Activity}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="p-8 text-center rounded-[2rem] bg-brand-500/5 border border-brand-500/10">
                      <div className="text-5xl font-black text-brand-400 mb-2">{attendanceCount}</div>
                      <p className="text-[10px] text-surface-400 font-bold uppercase tracking-[0.2em]">Total Check-ins</p>
                      <div className="w-full bg-surface-800 h-2 rounded-full mt-6 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (attendanceCount / 20) * 100)}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-brand-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                          />
                      </div>
                    </div>
                    <div className="space-y-4">
                       <div className="p-4 rounded-2xl bg-surface-900/40 border border-surface-800/40">
                          <p className="text-[9px] text-surface-500 font-bold uppercase tracking-[0.2em] mb-1">Consistency</p>
                          <p className="text-base font-bold text-surface-100">Excellent Growth</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-surface-900/40 border border-surface-800/40">
                          <p className="text-[9px] text-surface-500 font-bold uppercase tracking-[0.2em] mb-1">Next Milestone</p>
                          <p className="text-base font-bold text-brand-400">{20 - (attendanceCount % 20)} Sessions to Level Up</p>
                       </div>
                    </div>
                  </div>
                </SmallListCard>
              </>
            )}
          </div>

          {/* Right Column: Alerts, Sessions, and Info */}
          <div className="space-y-8">
            {/* Upcoming Sessions Section */}
            <SmallListCard 
              title="Training Schedule" 
              icon={Calendar}
              action={<Link href="/sessions" className="text-[10px] font-bold text-brand-400 hover:text-brand-300 uppercase tracking-widest flex items-center gap-1 group">Full Schedule <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /></Link>}
            >
              {upcomingSessions.length === 0 ? (
                <p className="text-sm text-surface-500 py-8 text-center bg-surface-900/20 rounded-2xl border border-dashed border-surface-800">No sessions scheduled</p>
              ) : (
                upcomingSessions.map((s, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={s._id} 
                    className="group relative flex items-start gap-4 p-4 rounded-2xl bg-surface-900/40 border border-surface-800/40 hover:border-brand-500/20 transition-all"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[50px] p-2 rounded-xl bg-brand-500/5 border border-brand-500/10 text-brand-400">
                      <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(s.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-black">{new Date(s.date).getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-surface-100 group-hover:text-brand-400 transition-colors">{s.eventName}</p>
                      <p className="text-xs text-surface-500 font-medium mt-1">{s.startTime} - {s.endTime}</p>
                      <p className="truncate text-[10px] text-surface-600 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                        <Activity className="w-3 h-3" />
                        {s.location}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </SmallListCard>

            {/* Inventory / Alerts Section (Only for Admin/Coach) */}
            {(role === 'admin' || role === 'coach') && (
              <SmallListCard 
                title="Stock Alerts" 
                icon={AlertTriangle}
                action={<Link href="/inventory" className="text-[10px] font-bold text-brand-400 hover:text-brand-300 uppercase tracking-widest">Inventory →</Link>}
              >
                {lowStock.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-success-500/5 border border-success-500/10">
                    <UserCheck className="w-8 h-8 text-success-500/30 mx-auto mb-2" />
                    <p className="text-sm text-success-400 font-bold tracking-tight">Stock Levels Healthy</p>
                  </div>
                ) : (
                  lowStock.map((item, i) => (
                    <motion.div 
                      key={item._id} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-2xl border ${item.isOutOfStock ? 'border-danger-500/20 bg-danger-500/5' : 'border-warning-500/20 bg-warning-500/5'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.isOutOfStock ? 'bg-danger-500/10 text-danger-400' : 'bg-warning-500/10 text-warning-400'}`}>
                          <PackageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-surface-100">{item.itemName}</p>
                          <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest">{item.sport}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${item.isOutOfStock ? "text-danger-400 animate-pulse" : "text-warning-400"}`}>
                          {item.currentStock === 0 ? "OUT" : item.currentStock}
                        </p>
                        <p className="text-[10px] text-surface-600 font-bold">/ {item.minThreshold}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </SmallListCard>
            )}

            {/* Sport Breakdown (Admin Only) */}
            {role === 'admin' && (
              <SmallListCard title="Club Composition" icon={BarChart3Icon}>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.sportBreakdown?.map((s) => ({ name: s._id, count: s.count })) || []} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                      <Bar dataKey="count" name="Members" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SmallListCard>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function BarChart3Icon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
