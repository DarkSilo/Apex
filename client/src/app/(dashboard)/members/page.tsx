"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Search, User, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import api from "@/lib/api";
import { Session, User as IUser } from "@/types";
import { formatDate, getStatusColor, getInitials } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  show: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.3 } }),
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

interface MemberModalProps {
  member: IUser | null;
  mode: "view" | "edit" | "add";
  canManageAttendance: boolean;
  attendanceSessions: Session[];
  onClose: () => void;
  onSave: () => void;
}

function MemberModal({ member, mode, canManageAttendance, attendanceSessions, onClose, onSave }: MemberModalProps) {
  const [form, setForm] = useState({
    name: member?.name || "",
    email: member?.email || "",
    password: "",
    sport: member?.sport || "Cricket",
    membershipType: member?.membershipType || "monthly",
    phone: member?.phone || "",
    status: member?.status || "active",
    role: member?.role || "member",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "add") {
        await api.post("/auth/register", form);
      } else if (mode === "edit" && member) {
        const { password, email, ...updateData } = form;
        await api.put(`/members/${member._id}`, updateData);
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogAttendance = async () => {
    if (!member) return;
    if (!selectedSessionId) {
      setAttendanceMsg("Please select a session first.");
      return;
    }
    setAttendanceLoading(true);
    setAttendanceMsg("");
    try {
      await api.post(`/members/${member._id}/attendance`, {
        date: new Date().toISOString(),
        sessionId: selectedSessionId,
      });
      setAttendanceMsg("Attendance logged successfully.");
      onSave();
    } catch (err: any) {
      setAttendanceMsg(err.response?.data?.message || "Failed to log attendance.");
    } finally {
      setAttendanceLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-surface-100">
            {mode === "add" ? "Add New Member" : mode === "edit" ? "Edit Member" : "Member Profile"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-700 rounded-lg transition-colors">
            <XCircle className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        {mode === "view" && member ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/30 to-brand-700/30 border border-brand-500/20 flex items-center justify-center text-2xl font-bold text-brand-400">
                {getInitials(member.name)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-surface-100">{member.name}</h3>
                <p className="text-sm text-surface-400">{member.email}</p>
                <span className={`badge mt-1 ${getStatusColor(member.status)}`}>{member.status}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: "Role", value: member.role },
                { label: "Sport", value: member.sport },
                { label: "Membership", value: member.membershipType },
                { label: "Phone", value: member.phone || "—" },
                { label: "Joined", value: formatDate(member.createdAt) },
                { label: "Attendance", value: `${member.attendance?.length || 0} sessions` },
              ].map((f) => (
                <div key={f.label} className="p-3 rounded-lg bg-surface-800/50 border border-surface-700/30">
                  <p className="text-xs text-surface-500">{f.label}</p>
                  <p className="text-sm font-medium text-surface-200 capitalize mt-0.5">{f.value}</p>
                </div>
              ))}
            </div>
            {canManageAttendance && member.role === "member" && (
              <div className="pt-3 border-t border-surface-700/40">
                <select
                  className="input-field mb-2"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                >
                  <option value="">Select related session...</option>
                  {attendanceSessions.map((s) => (
                    <option key={s._id} value={s._id}>{s.eventName} ({formatDate(s.date)})</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleLogAttendance}
                  disabled={attendanceLoading}
                  className="btn-primary"
                >
                  {attendanceLoading ? "Logging..." : "Mark Attendance (Now)"}
                </button>
                {attendanceMsg && (
                  <p className="text-xs text-surface-400 mt-2">{attendanceMsg}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">{error}</div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Full Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Full name" required id="member-name" />
              </div>
              {mode === "add" && (
                <>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-surface-400 mb-1.5">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="email@apex.lk" required id="member-email" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-surface-400 mb-1.5">Password</label>
                    <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" placeholder="Min 6 characters" required minLength={6} id="member-password" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Sport</label>
                <select name="sport" value={form.sport} onChange={handleChange} className="input-field" id="member-sport">
                  {["Cricket", "Football", "Badminton"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Membership</label>
                <select name="membershipType" value={form.membershipType} onChange={handleChange} className="input-field" id="member-membership">
                  {["monthly", "annual", "lifetime"].map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="input-field" id="member-role">
                  {["member", "coach", "admin"].map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="+94 77 ..." id="member-phone" />
              </div>
              {mode === "edit" && (
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-surface-400 mb-1.5">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className="input-field" id="member-status">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center" id="member-save">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : mode === "add" ? "Add Member" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<IUser[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<{ member: IUser | null; mode: "view" | "edit" | "add" } | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterRole) params.set("role", filterRole);
      if (filterStatus) params.set("status", filterStatus);
      if (filterSport) params.set("sport", filterSport);
      params.set("page", page.toString());

       if (user?.role === "coach") {
        params.set("role", "member");
        if (user.sport) params.set("sport", user.sport);
      }

      const requests: Promise<any>[] = [api.get(`/members?${params}`)];
      if (user?.role === "coach") {
        requests.push(api.get(`/sessions?coachId=${user.id || user._id}&status=scheduled`));
      }

      const [res, sessionsRes] = await Promise.all(requests);
      setMembers(res.data.members);
      setTotalPages(res.data.pagination.pages);
      setAttendanceSessions(sessionsRes?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, filterRole, filterStatus, filterSport, page, user]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/members/${id}/status`);
      fetchMembers();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <Topbar title="Members" subtitle="Manage club participants and profiles" />
      <div className="p-8 space-y-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-9 w-64" placeholder="Search members..." id="member-search" />
            </div>
            {user?.role !== "coach" && (
              <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }} className="input-field w-36" id="filter-role">
                <option value="">All Roles</option>
                <option value="member">Member</option>
                <option value="coach">Coach</option>
                <option value="admin">Admin</option>
              </select>
            )}
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="input-field w-36" id="filter-status">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {user?.role !== "coach" && (
              <select value={filterSport} onChange={(e) => { setFilterSport(e.target.value); setPage(1); }} className="input-field w-36" id="filter-sport">
                <option value="">All Sports</option>
                <option value="Cricket">Cricket</option>
                <option value="Football">Football</option>
                <option value="Badminton">Badminton</option>
              </select>
            )}
          </div>
          {user?.role === "admin" && (
            <button onClick={() => setModal({ member: null, mode: "add" })} className="btn-primary flex items-center gap-2 whitespace-nowrap" id="add-member-btn">
              <Plus className="w-4 h-4" /> Add Member
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Sport</th>
                <th>Role</th>
                <th>Membership</th>
                <th>Status</th>
                <th>Joined</th>
                {(user?.role === "admin" || user?.role === "coach") && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j}><div className="h-4 bg-surface-700/50 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-surface-500">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No members found
                    </td>
                  </tr>
                ) : (
                  members.map((m, i) => (
                    <motion.tr
                      key={m._id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      layout
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500/20 to-brand-700/20 border border-brand-500/10 flex items-center justify-center text-xs font-bold text-brand-400">
                            {getInitials(m.name)}
                          </div>
                          <div>
                            <p className="font-medium text-surface-200">{m.name}</p>
                            <p className="text-xs text-surface-500">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className="text-surface-300">{m.sport}</span></td>
                      <td><span className={`badge ${getStatusColor(m.role)} capitalize`}>{m.role}</span></td>
                      <td><span className="text-surface-300 capitalize">{m.membershipType}</span></td>
                      <td><span className={`badge ${getStatusColor(m.status)}`}>{m.status}</span></td>
                      <td><span className="text-surface-400 text-sm">{formatDate(m.createdAt)}</span></td>
                      {(user?.role === "admin" || user?.role === "coach") && (
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setModal({ member: m, mode: "view" })} className="p-1.5 hover:bg-surface-700 rounded-lg transition-colors text-surface-400 hover:text-brand-400" title="View" id={`view-member-${m._id}`}>
                              <User className="w-4 h-4" />
                            </button>
                            {user?.role === "admin" && (
                              <>
                                <button onClick={() => handleToggleStatus(m._id)} className={`p-1.5 rounded-lg transition-colors ${m.status === "active" ? "text-success-400 hover:bg-success-500/10" : "text-danger-400 hover:bg-danger-500/10"}`} title={m.status === "active" ? "Deactivate" : "Activate"} id={`toggle-member-${m._id}`}>
                                  {m.status === "active" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-2" id="prev-page"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm text-surface-400">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary px-3 py-2" id="next-page"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <MemberModal
            member={modal.member}
            mode={modal.mode}
            canManageAttendance={user?.role === "admin" || user?.role === "coach"}
            attendanceSessions={attendanceSessions}
            onClose={() => setModal(null)}
            onSave={fetchMembers}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
