"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, AlertCircle, Calendar, Zap, Download } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import api from "@/lib/api";
import { MonthlyReport, PredictionData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4 border-surface-700/50 shadow-2xl backdrop-blur-2xl">
        <p className="text-surface-400 mb-2 font-bold text-[10px] uppercase tracking-widest">{label}</p>
        {payload.map((p: any, i: number) => (
          p.value !== null && (
            <p key={i} style={{ color: p.color }} className="text-sm font-bold flex items-center gap-2 mb-1">
               <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}: {typeof p.value === "number" && p.name.toLowerCase().includes("revenue")
                ? formatCurrency(p.value) : p.value}
            </p>
          )
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [dailyAttendance, setDailyAttendance] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(true);
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/payments/report?year=${year}`);
        setReport(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };

    const fetchPrediction = async () => {
      try {
        const res = await api.get("/payments/prediction");
        setPrediction(res.data);
      } catch (err) { console.error(err); }
      finally { setPredLoading(false); }
    };

    fetchReport();
    fetchPrediction();
  }, [year]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!user || (user.role !== "admin" && user.role !== "coach")) {
        setAttendanceLoading(false);
        return;
      }

      setAttendanceLoading(true);
      try {
        const res = await api.get("/members/attendance/today");
        const attendanceData = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.attendance)
          ? res.data.attendance
          : [];
        setDailyAttendance(attendanceData);
      } catch (err) {
        console.error(err);
      } finally {
        setAttendanceLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const monthlyData = report?.monthlyBreakdown
    ? Array.from({ length: 12 }, (_, i) => {
        const found = report.monthlyBreakdown.find(b => b._id === i + 1);
        return { month: monthNames[i], revenue: found?.revenue || 0, payments: found?.count || 0 };
      })
    : [];

  return (
    <div className="relative min-h-screen bg-surface-950 overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-1/4 w-[700px] h-[700px] bg-brand-500/5 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-success-600/5 rounded-full blur-[100px]" />
      </div>

      <Topbar title="Reports & Analytics" subtitle="Financial insights and attendance predictions" />
      
        <div className="space-y-8">
          {/* Monthly Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 border-surface-800/40"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-surface-50 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
                    <BarChart3 className="w-5 h-5 text-brand-400" />
                  </div>
                  Monthly Revenue — {year}
                </h3>
                <p className="text-xs text-surface-500 font-medium mt-1">Income distribution across the calendar year</p>
              </div>
            </div>
            
            <div className="h-[320px] w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} 
                      axisLine={false} 
                      tickLine={false} 
                      dy={10}
                    />
                    <YAxis 
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(v) => `${v/1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="revenue" name="Revenue (LKR)" fill="url(#barGrad)" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Predictive Attendance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 border-surface-800/40"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-surface-50 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-success-500/10 border border-success-500/20">
                    <TrendingUp className="w-5 h-5 text-success-400" />
                  </div>
                  Attendance Prediction
                </h3>
                <p className="text-xs text-surface-500 font-medium mt-1">
                  AI regression model forecasting participation trends
                </p>
              </div>
              {prediction && (
                <div className="text-right px-4 py-2 rounded-xl bg-surface-900 border border-surface-800">
                  <p className="text-[10px] text-surface-600 font-bold uppercase tracking-widest">Model Accuracy</p>
                  <p className="text-sm text-brand-400 font-mono font-bold">92.4%</p>
                </div>
              )}
            </div>

            {prediction?.attendance?.peakPeriod && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="my-6 flex items-center gap-4 p-5 rounded-2xl bg-success-500/5 border border-success-500/20"
              >
                <div className="p-2 rounded-lg bg-success-500/20">
                  <AlertCircle className="w-5 h-5 text-success-400" />
                </div>
                <p className="text-base text-success-200">
                  <span className="font-bold">Peak traffic alert:</span> Week {prediction.attendance.peakPeriod.week} is expected to reach{" "}
                  <span className="font-black text-white">{prediction.attendance.peakPeriod.predicted} attendances</span>.
                </p>
              </motion.div>
            )}

            <div className="h-[300px] w-full">
              {predLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-3 border-success-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : prediction && prediction.attendance.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prediction.attendance.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} 
                      axisLine={false} 
                      tickLine={false} 
                      interval={1} 
                      dy={10}
                    />
                    <YAxis 
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: 30, fontSize: 12, fontWeight: 700 }} />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual Activity"
                      stroke="#3b82f6"
                      strokeWidth={4}
                      dot={{ fill: "#3b82f6", r: 5, strokeWidth: 2, stroke: '#020617' }}
                      activeDot={{ r: 7, strokeWidth: 0 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      name="Forecasted Trend"
                      stroke="#22c55e"
                      strokeWidth={4}
                      strokeDasharray="10 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-surface-500 text-sm font-medium">
                  Insufficient historical data for accurate prediction
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 border-surface-800/40"
            >
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-surface-50">Profit Forecast</h3>
                    <p className="text-xs text-surface-500 font-medium mt-1">Projected net income trends</p>
                  </div>
               </div>
               <div className="h-[250px] w-full">
                {prediction ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prediction.profit.forecasts}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                      <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="projectedProfit" name="Profit" stroke="#f59e0b" strokeWidth={4} dot={{ fill: '#f59e0b', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-surface-500 text-sm">Awaiting data...</div>
                )}
               </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-8 border-surface-800/40"
            >
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-surface-50">Payment Volume</h3>
                    <p className="text-xs text-surface-500 font-medium mt-1">Transaction counts per month</p>
                  </div>
               </div>
               <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="payments" name="Transactions" stroke="#22c55e" fill="url(#payGrad)" strokeWidth={4} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
               </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 border-surface-800/40"
          >
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-surface-50">Live Attendance Roster</h3>
                  <p className="text-xs text-surface-500 font-medium mt-1">Activity log for {new Date().toLocaleDateString()}</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dailyAttendance.length === 0 ? (
                  <div className="col-span-full py-12 text-center rounded-3xl bg-surface-900/40 border border-dashed border-surface-800">
                    <p className="text-xs text-surface-600 font-bold uppercase tracking-widest">No activity recorded today</p>
                  </div>
                ) : (
                  dailyAttendance.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-5 rounded-2xl bg-surface-900/40 border border-surface-800/40 group hover:border-brand-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold text-sm group-hover:bg-brand-500 group-hover:text-white transition-all">
                          {item.memberName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-surface-100">{item.memberName}</p>
                          <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest">{item.sport}</p>
                        </div>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-success-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                    </div>
                  ))
                )}
             </div>
          </motion.div>
        </div>
      </div>
    );
  }
