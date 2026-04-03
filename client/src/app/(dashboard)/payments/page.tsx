"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Plus, Search, Receipt, XCircle, TrendingUp } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import api from "@/lib/api";
import { Payment, User } from "@/types";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
  exit: { opacity: 0 },
};

interface PaymentModalProps {
  onClose: () => void;
  onSave: () => void;
  members: User[];
}

function PaymentModal({ onClose, onSave, members }: PaymentModalProps) {
  const [form, setForm] = useState({
    memberId: "", amount: 2500, date: new Date().toISOString().split("T")[0],
    status: "completed", method: "cash", description: "Membership Fee",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const member = members.find(m => m._id === e.target.value);
    const amounts: Record<string, number> = { monthly: 2500, annual: 25000, lifetime: 75000 };
    setForm({
      ...form, memberId: e.target.value,
      amount: amounts[member?.membershipType || "monthly"] || 2500,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/payments", form);
      onSave(); onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to record payment");
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="glass-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-surface-100">Record Payment</h2>
          <button onClick={onClose}><XCircle className="w-5 h-5 text-surface-500" /></button>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">Member</label>
            <select name="memberId" value={form.memberId} onChange={handleMemberChange} className="input-field" required id="pay-member">
              <option value="">Select member...</option>
              {members.map(m => <option key={m._id} value={m._id}>{m.name} ({m.membershipType})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Amount (LKR)</label>
              <input name="amount" type="number" min={0} value={form.amount} onChange={handleChange} className="input-field" required id="pay-amount" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} className="input-field" required id="pay-date" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Method</label>
              <select name="method" value={form.method} onChange={handleChange} className="input-field" id="pay-method">
                {["cash", "card", "bank_transfer", "online"].map(m => (
                  <option key={m} value={m} className="capitalize">{m.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field" id="pay-status">
                {["completed", "pending", "failed"].map(s => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">Description</label>
            <input name="description" value={form.description} onChange={handleChange} className="input-field" id="pay-desc" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center" id="pay-save">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Record Payment"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterMethod) params.set("method", filterMethod);

      const [paymentsRes, membersRes] = await Promise.all([
        api.get(`/payments?${params}`),
        api.get("/members?role=member&limit=100"),
      ]);

      const pList = paymentsRes.data || [];
      setPayments(pList);
      setMembers(membersRes.data.members || []);
      setTotalRevenue(pList.filter((p: Payment) => p.status === "completed").reduce((s: number, p: Payment) => s + p.amount, 0));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filterStatus, filterMethod]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePrint = (payment: Payment) => {
    const member = payment.memberId as User;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Receipt ${payment.receiptNumber}</title>
      <style>body{font-family:monospace;padding:20px;max-width:400px;margin:0 auto}
      h1{font-size:18px;text-align:center}hr{border:1px dashed #ccc}
      .row{display:flex;justify-content:space-between;margin:8px 0;font-size:14px}
      .total{font-size:18px;font-weight:bold;border-top:2px solid #000;padding-top:10px}</style>
      </head><body>
      <h1>APEX Sports Club</h1><h2 style="text-align:center;font-size:14px">OFFICIAL RECEIPT</h2><hr/>
      <div class="row"><span>Receipt No:</span><span>${payment.receiptNumber}</span></div>
      <div class="row"><span>Member:</span><span>${member?.name || "N/A"}</span></div>
      <div class="row"><span>Date:</span><span>${formatDate(payment.date)}</span></div>
      <div class="row"><span>Method:</span><span>${payment.method}</span></div>
      <div class="row"><span>Description:</span><span>${payment.description}</span></div>
      <hr/><div class="row total"><span>TOTAL:</span><span>LKR ${payment.amount.toLocaleString()}</span></div>
      <hr/><p style="font-size:11px;text-align:center;color:#666">Thank you for your payment!</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  const statusSummary = [
    { label: "Total Revenue", value: formatCurrency(totalRevenue), color: "text-success-400" },
    { label: "Completed", value: payments.filter(p => p.status === "completed").length, color: "text-success-400" },
    { label: "Pending", value: payments.filter(p => p.status === "pending").length, color: "text-warning-400" },
    { label: "Total Records", value: payments.length, color: "text-brand-400" },
  ];

  return (
    <div>
      <Topbar title="Payments" subtitle="Track fees and financial transactions" />
      <div className="p-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusSummary.map((s) => (
            <motion.div key={s.label} whileHover={{ scale: 1.02 }} className="glass-card p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-surface-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-36" id="pay-filter-status">
              <option value="">All Status</option>
              {["completed", "pending", "failed", "refunded"].map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
            <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="input-field w-40" id="pay-filter-method">
              <option value="">All Methods</option>
              {["cash", "card", "bank_transfer", "online"].map(m => (
                <option key={m} value={m}>{m.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          {user?.role === "admin" && (
            <div className="flex gap-3">
              <a href="/reports" className="btn-secondary flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> View Reports
              </a>
              <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2" id="add-payment-btn">
                <Plus className="w-4 h-4" /> Record Payment
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Description</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>{[...Array(7)].map((_, j) => (
                      <td key={j}><div className="h-4 bg-surface-700/50 rounded animate-pulse" /></td>
                    ))}</tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-surface-500">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-30" />No payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((p, i) => {
                    const member = p.memberId as User;
                    return (
                      <motion.tr key={p._id} custom={i} variants={rowVariants} initial="hidden" animate="show" exit="exit" layout>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
                              {(member?.name || "?")[0]}
                            </div>
                            <div>
                              <p className="font-medium text-surface-200 text-sm">{member?.name || "Unknown"}</p>
                              <p className="text-xs text-surface-500">{member?.sport}</p>
                            </div>
                          </div>
                        </td>
                        <td><span className="font-bold text-success-400">{formatCurrency(p.amount)}</span></td>
                        <td><span className="text-surface-400 text-sm">{formatDate(p.date)}</span></td>
                        <td><span className="text-surface-300 capitalize text-sm">{p.method?.replace("_", " ")}</span></td>
                        <td><span className="text-surface-400 text-sm truncate max-w-[150px] block">{p.description}</span></td>
                        <td><span className={`badge ${getStatusColor(p.status)} capitalize`}>{p.status}</span></td>
                        <td>
                          <button onClick={() => handlePrint(p)} className="p-1.5 hover:bg-surface-700 rounded-lg text-surface-400 hover:text-brand-400 transition-colors" title="Print Receipt" id={`receipt-${p._id}`}>
                            <Receipt className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && <PaymentModal members={members} onClose={() => setShowModal(false)} onSave={fetchData} />}
      </AnimatePresence>
    </div>
  );
}
