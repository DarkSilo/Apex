"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Plus, Receipt, XCircle, TrendingUp, CheckCircle2 } from "lucide-react";
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
  mode: "direct" | "request";
}

function AdminPaymentModal({ onClose, onSave, members, mode }: PaymentModalProps) {
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
      if (mode === "request") {
        await api.post("/payments/request", {
          memberId: form.memberId,
          amount: form.amount,
          date: form.date,
          method: form.method,
          description: form.description,
        });
      } else {
        await api.post("/payments", form);
      }
      onSave(); onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save payment");
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
          <h2 className="text-lg font-bold text-surface-100">{mode === "request" ? "Create Payment Request" : "Record Direct Payment"}</h2>
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
              {mode === "request" ? (
                <div className="input-field text-surface-300">requested</div>
              ) : (
                <select name="status" value={form.status} onChange={handleChange} className="input-field" id="pay-status">
                  {["completed", "pending", "failed"].map(s => (
                    <option key={s} value={s} className="capitalize">{s}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-400 mb-1.5">Description</label>
            <input name="description" value={form.description} onChange={handleChange} className="input-field" id="pay-desc" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center" id="pay-save">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : mode === "request" ? "Create Request" : "Record Payment"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function MemberSubmitModal({
  payment,
  onClose,
  onSave,
}: {
  payment: Payment;
  onClose: () => void;
  onSave: () => void;
}) {
  const [method, setMethod] = useState<"cash" | "card" | "bank_transfer" | "online">("online");
  const [memberReference, setMemberReference] = useState("");
  const [memberNote, setMemberNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.patch(`/payments/${payment._id}/submit`, { method, memberReference, memberNote });
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-surface-100 mb-4">Submit Mock Payment</h2>
        <p className="text-xs text-surface-400 mb-4">Amount: {formatCurrency(payment.amount)}</p>
        {error && <div className="mb-3 p-2 rounded bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-surface-400 mb-1">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="input-field">
              {["cash", "card", "bank_transfer", "online"].map((m) => (
                <option key={m} value={m}>{m.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-surface-400 mb-1">Payment Reference</label>
            <input value={memberReference} onChange={(e) => setMemberReference(e.target.value)} className="input-field" placeholder="e.g. MOCKTXN-12345" required />
          </div>
          <div>
            <label className="block text-xs text-surface-400 mb-1">Note (optional)</label>
            <input value={memberNote} onChange={(e) => setMemberNote(e.target.value)} className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? "Submitting..." : "Submit Payment"}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function VerifyModal({
  payment,
  onClose,
  onSave,
}: {
  payment: Payment;
  onClose: () => void;
  onSave: () => void;
}) {
  const [verificationNote, setVerificationNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (isApproved: boolean) => {
    setLoading(true);
    setError("");
    try {
      await api.patch(`/payments/${payment._id}/verify`, { isApproved, verificationNote });
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to verify payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-surface-100 mb-2">Verify Member Payment</h2>
        <p className="text-xs text-surface-400 mb-1">Reference: {payment.memberReference || "N/A"}</p>
        <p className="text-xs text-surface-400 mb-4">Amount: {formatCurrency(payment.amount)}</p>
        {error && <div className="mb-3 p-2 rounded bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs">{error}</div>}
        <div>
          <label className="block text-xs text-surface-400 mb-1">Verification note</label>
          <input value={verificationNote} onChange={(e) => setVerificationNote(e.target.value)} className="input-field" />
        </div>
        <div className="flex gap-3 mt-4">
          <button type="button" onClick={() => handleVerify(false)} disabled={loading} className="btn-danger flex-1">Reject</button>
          <button type="button" onClick={() => handleVerify(true)} disabled={loading} className="btn-primary flex-1">Approve</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const normalizedRole = String(user?.role || "").trim().toLowerCase();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submitTarget, setSubmitTarget] = useState<Payment | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<Payment | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const actionablePayments = payments.filter((p) => {
    const normalizedStatus = String(p.status || "").trim().toLowerCase();
    return normalizedStatus === "requested" || normalizedStatus === "pending";
  });
  const myActionableCount = actionablePayments.length;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterMethod) params.set("method", filterMethod);

      const requests: Promise<any>[] = [api.get(`/payments?${params}`)];
      if (user?.role === "admin") {
        requests.push(api.get("/members?role=member&limit=100"));
      }
      const [paymentsRes, membersRes] = await Promise.all(requests);

      const pList = paymentsRes.data || [];
      setPayments(pList);
      setMembers(membersRes?.data?.members || []);
      setTotalRevenue(pList.filter((p: Payment) => p.status === "completed").reduce((s: number, p: Payment) => s + p.amount, 0));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filterStatus, filterMethod, user?.role]);

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
    { label: "Requested", value: payments.filter(p => p.status === "requested").length, color: "text-brand-400" },
    { label: "Submitted", value: payments.filter(p => p.status === "submitted").length, color: "text-warning-400" },
    { label: "Completed", value: payments.filter(p => p.status === "completed").length, color: "text-success-400" },
    { label: "Total Records", value: payments.length, color: "text-surface-300" },
  ];

  return (
    <div>
      <Topbar title="Payments" subtitle="Track fees and financial transactions" />
      <div className="p-8 space-y-6">
        {normalizedRole === "member" && (
          <div className="glass-card p-4 border border-brand-500/20">
            <p className="text-sm text-surface-200">
              You have <span className="font-semibold text-brand-300">{myActionableCount}</span> payment request{myActionableCount === 1 ? "" : "s"} to submit.
            </p>
            <p className="text-xs text-surface-500 mt-1">Use the Submit Payment button in rows marked requested or pending.</p>
          </div>
        )}

        {normalizedRole === "member" && myActionableCount > 0 && (
          <div className="glass-card p-4 border border-success-500/20">
            <h3 className="text-sm font-semibold text-surface-100 mb-3">Payment Requests Awaiting Your Submission</h3>
            <div className="space-y-2">
              {actionablePayments.map((payment) => {
                const member = payment.memberId as User;
                return (
                  <div key={payment._id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg bg-surface-800/40 border border-surface-700/50 p-3">
                    <div>
                      <p className="text-sm text-surface-200 font-medium">{formatCurrency(payment.amount)} · {payment.description}</p>
                      <p className="text-xs text-surface-500">{member?.name || "Member"} · {formatDate(payment.date)} · {String(payment.status).toLowerCase()}</p>
                    </div>
                    <button
                      onClick={() => setSubmitTarget(payment)}
                      className="btn-primary px-3 py-1.5 text-xs self-start md:self-auto"
                      id={`submit-top-${payment._id}`}
                    >
                      Submit Payment
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
              {["requested", "submitted", "completed", "pending", "failed", "refunded"].map(s => (
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
          {normalizedRole === "admin" && (
            <div className="flex gap-3">
              <a href="/reports" className="btn-secondary flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> View Reports
              </a>
              <button onClick={() => setShowRequestModal(true)} className="btn-secondary flex items-center gap-2" id="add-payment-request-btn">
                <Plus className="w-4 h-4" /> Create Request
              </button>
              <button onClick={() => setShowDirectModal(true)} className="btn-primary flex items-center gap-2" id="add-payment-btn">
                <Plus className="w-4 h-4" /> Record Direct Payment
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
                <th>Actions</th>
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
                    const normalizedStatus = String(p.status || "").trim().toLowerCase();
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
                        <td>
                          <div className="space-y-1">
                            <span className={`badge ${getStatusColor(normalizedStatus)} capitalize`}>{normalizedStatus}</span>
                            {p.memberReference && <p className="text-[10px] text-surface-500">Ref: {p.memberReference}</p>}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {normalizedStatus === "completed" && (
                              <button onClick={() => handlePrint(p)} className="p-1.5 hover:bg-surface-700 rounded-lg text-surface-400 hover:text-brand-400 transition-colors" title="Print Receipt" id={`receipt-${p._id}`}>
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}
                            {normalizedRole === "member" && (normalizedStatus === "requested" || normalizedStatus === "pending") && (
                              <button
                                onClick={() => setSubmitTarget(p)}
                                className="btn-primary px-2.5 py-1.5 text-xs"
                                title="Submit payment"
                                id={`pay-now-${p._id}`}
                              >
                                Submit Payment
                              </button>
                            )}
                            {normalizedRole === "admin" && normalizedStatus === "submitted" && (
                              <button onClick={() => setVerifyTarget(p)} className="p-1.5 hover:bg-surface-700 rounded-lg text-surface-400 hover:text-success-400 transition-colors" title="Verify payment" id={`verify-${p._id}`}>
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
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
        {showDirectModal && <AdminPaymentModal mode="direct" members={members} onClose={() => setShowDirectModal(false)} onSave={fetchData} />}
      </AnimatePresence>

      <AnimatePresence>
        {showRequestModal && <AdminPaymentModal mode="request" members={members} onClose={() => setShowRequestModal(false)} onSave={fetchData} />}
      </AnimatePresence>

      <AnimatePresence>
        {submitTarget && <MemberSubmitModal payment={submitTarget} onClose={() => setSubmitTarget(null)} onSave={fetchData} />}
      </AnimatePresence>

      <AnimatePresence>
        {verifyTarget && <VerifyModal payment={verifyTarget} onClose={() => setVerifyTarget(null)} onSave={fetchData} />}
      </AnimatePresence>
    </div>
  );
}
