"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import api from "@/lib/api";
import { MonthlyReport, PredictionData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-xs shadow-xl">
        <p className="text-surface-400 mb-1.5 font-medium">{label}</p>
        {payload.map((p: any, i: number) => (
          p.value !== null && (
            <p key={i} style={{ color: p.color }} className="font-semibold mb-0.5">
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
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
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

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const monthlyData = report?.monthlyBreakdown
    ? Array.from({ length: 12 }, (_, i) => {
        const found = report.monthlyBreakdown.find(b => b._id === i + 1);
        return { month: monthNames[i], revenue: found?.revenue || 0, payments: found?.count || 0 };
      })
    : [];

  return (
    <div>
      <Topbar title="Reports & Analytics" subtitle="Financial insights and attendance predictions" />
      <div className="p-8 space-y-8">

        {/* Summary Stats */}
        {!loading && report && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {[
              { label: "Annual Revenue", value: formatCurrency(report.summary?.totalRevenue || 0), sub: `Year ${year}`, color: "from-success-500/20 to-success-600/10", text: "text-success-400" },
              { label: "Total Transactions", value: report.summary?.totalPayments || 0, sub: "Completed payments", color: "from-brand-500/20 to-brand-600/10", text: "text-brand-400" },
              { label: "Avg. Payment", value: formatCurrency(report.summary?.avgPayment || 0), sub: "Per transaction", color: "from-warning-500/20 to-warning-600/10", text: "text-warning-400" },
            ].map((s) => (
              <motion.div key={s.label} whileHover={{ scale: 1.02 }}
                className={`glass-card p-6 bg-gradient-to-br ${s.color}`}>
                <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
                <p className="text-sm text-surface-400 mt-1">{s.label}</p>
                <p className="text-xs text-surface-600 mt-0.5">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Monthly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-surface-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-400" />
                Monthly Revenue — {year}
              </h3>
              <p className="text-xs text-surface-500 mt-1">Income breakdown by month</p>
            </div>
          </div>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue (LKR)" fill="url(#barGrad)" radius={[6, 6, 0, 0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Predictive Attendance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-surface-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success-400" />
                Attendance Prediction
              </h3>
              <p className="text-xs text-surface-500 mt-1">
                Linear regression model (y = β₀ + β₁x) — actual vs. forecasted weekly attendance
              </p>
            </div>
            {prediction && (
              <div className="text-right">
                <p className="text-xs text-surface-500">Model Coefficients</p>
                <p className="text-xs text-brand-400 font-mono">
                  β₀={prediction.model.intercept} β₁={prediction.model.slope}
                </p>
              </div>
            )}
          </div>

          {/* Peak Period Alert */}
          {prediction?.peakPeriod && (
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="my-4 flex items-center gap-3 p-3 rounded-lg bg-success-500/10 border border-success-500/20"
            >
              <AlertCircle className="w-4 h-4 text-success-400 flex-shrink-0" />
              <p className="text-sm text-success-300">
                <span className="font-semibold">Peak period forecast:</span> Week {prediction.peakPeriod.week} — estimated{" "}
                <span className="font-bold">{prediction.peakPeriod.predicted} attendances</span>
              </p>
            </motion.div>
          )}

          {predLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-success-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : prediction && prediction.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={prediction.chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: "#64748b", fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual Attendance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 3 }}
                  connectNulls={false}
                  animationDuration={1500}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted Attendance"
                  stroke="#22c55e"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-surface-500 text-sm">
              Not enough attendance data for prediction yet
            </div>
          )}
        </motion.div>

        {/* Payment Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold text-surface-100 mb-2">Payment Volume Trend</h3>
          <p className="text-xs text-surface-500 mb-6">Number of transactions per month</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="payments" name="Transactions" stroke="#22c55e" fill="url(#payGrad)" strokeWidth={2} dot={false} animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </div>
  );
}
