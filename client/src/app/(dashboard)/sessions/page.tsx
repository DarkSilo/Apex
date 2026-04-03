"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Plus, Search, Edit2, Trash2, XCircle, AlertTriangle, MapPin, Clock } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import api from "@/lib/api";
import { Session, User } from "@/types";
import { formatDate, getStatusColor } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const emptyForm = {
  eventName: "", date: "", startTime: "09:00", endTime: "11:00",
  location: "", coachId: "", sport: "Cricket", maxParticipants: 20, description: "",
};

interface ConflictInfo {
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface SessionModalProps {
  session: Session | null;
  coaches: User[];
  currentCoach?: User | null;
  onClose: () => void;
  onSave: () => void;
}

function SessionModal({ session, coaches, currentCoach, onClose, onSave }: SessionModalProps) {
  const [form, setForm] = useState(session ? {
    eventName: session.eventName,
    date: session.date.split("T")[0],
    startTime: session.startTime,
    endTime: session.endTime,
    location: session.location,
    coachId: typeof session.coachId === "object" ? (session.coachId as User)._id : session.coachId,
    sport: session.sport,
    maxParticipants: session.maxParticipants,
    description: session.description,
  } : {
    ...emptyForm,
    coachId: currentCoach?._id || "",
    sport: currentCoach?.sport || emptyForm.sport,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
    setConflict(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setConflict(null);
    try {
      if (session) {
        await api.put(`/sessions/${session._id}`, form);
      } else {
        await api.post("/sessions", form);
      }
      onSave();
      onClose();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setConflict(err.response.data.conflict);
        setError("Schedule conflict: This coach is already booked.");
      } else {
        setError(err.response?.data?.message || "Operation failed");
      }
    } finally {
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
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-surface-100">{session ? "Edit Session" : "Create Session"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-700 rounded-lg"><XCircle className="w-5 h-5 text-surface-500" /></button>
        </div>

        {/* Conflict Warning */}
        <AnimatePresence>
          {conflict && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 rounded-xl bg-danger-500/10 border border-danger-500/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-danger-400" />
                <p className="text-sm font-semibold text-danger-400">Coach Schedule Conflict</p>
              </div>
              <p className="text-xs text-danger-300">{conflict.eventName}</p>
              <p className="text-xs text-danger-400">{formatDate(conflict.date)} · {conflict.startTime} – {conflict.endTime}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && !conflict && (
          <div className="mb-4 p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Event Name</label>
              <input name="eventName" value={form.eventName} onChange={handleChange} className="input-field" placeholder="e.g. Cricket Batting Practice" required id="session-name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} className="input-field" required id="session-date" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Sport</label>
              <select name="sport" value={form.sport} onChange={handleChange} className="input-field" id="session-sport">
                {["Cricket", "Football", "Badminton"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Start Time</label>
              <input name="startTime" type="time" value={form.startTime} onChange={handleChange} className="input-field" required id="session-start" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">End Time</label>
              <input name="endTime" type="time" value={form.endTime} onChange={handleChange} className="input-field" required id="session-end" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Assign Coach</label>
              {currentCoach ? (
                <div className="input-field flex items-center text-surface-300">
                  {currentCoach.name} ({currentCoach.sport})
                </div>
              ) : (
                <select name="coachId" value={form.coachId} onChange={handleChange} className="input-field" required id="session-coach">
                  <option value="">Select coach...</option>
                  {coaches.map(c => <option key={c._id} value={c._id}>{c.name} ({c.sport})</option>)}
                </select>
              )}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="e.g. Main Cricket Ground" required id="session-location" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Max Participants</label>
              <input name="maxParticipants" type="number" min={1} value={form.maxParticipants} onChange={handleChange} className="input-field" id="session-max" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input-field resize-none" placeholder="Optional notes..." id="session-desc" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center" id="session-save">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : session ? "Save Changes" : "Create Session"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function SessionsPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [coaches, setCoaches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("scheduled");
  const [filterSport, setFilterSport] = useState("");
  const [modal, setModal] = useState<{ session: Session | null } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      if (filterSport) params.set("sport", filterSport);

      if (user?.role === "member" && user.sport) {
        params.set("sport", user.sport);
      }
      if (user?.role === "coach" && user.id) {
        params.set("coachId", user.id);
      }

      const requests: Promise<any>[] = [api.get(`/sessions?${params}`)];
      if (user?.role !== "coach") {
        requests.push(api.get("/members?role=coach&limit=100"));
      }

      const [sessionsRes, usersRes] = await Promise.all(requests);
      setSessions(sessionsRes.data);
      if (user?.role === "coach") {
        setCoaches(user ? [{ ...user, _id: user.id || user._id }] as User[] : []);
      } else {
        setCoaches(usersRes?.data.members || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, filterStatus, filterSport, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this session?")) return;
    try { await api.delete(`/sessions/${id}`); fetchData(); }
    catch (err) { console.error(err); }
  };

  const handleCancel = async (id: string) => {
    try { await api.patch(`/sessions/${id}/cancel`); fetchData(); }
    catch (err) { console.error(err); }
  };

  const getStatusIcon = (status: string) => {
    if (status === "scheduled") return <div className="w-2 h-2 rounded-full bg-brand-400" />;
    if (status === "completed") return <div className="w-2 h-2 rounded-full bg-success-400" />;
    return <div className="w-2 h-2 rounded-full bg-surface-600" />;
  };

  return (
    <div>
      <Topbar title="Training Sessions" subtitle="Schedule and manage training events" />
      <div className="p-8 space-y-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 w-56" placeholder="Search sessions..." id="session-search" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field w-36" id="filter-session-status">
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {user?.role !== "member" && (
              <select value={filterSport} onChange={(e) => setFilterSport(e.target.value)} className="input-field w-36" id="filter-session-sport">
                <option value="">All Sports</option>
                {["Cricket", "Football", "Badminton"].map(s => <option key={s}>{s}</option>)}
              </select>
            )}
          </div>
          {(user?.role === "admin" || user?.role === "coach") && (
            <button onClick={() => setModal({ session: null })} className="btn-primary flex items-center gap-2 whitespace-nowrap" id="add-session-btn">
              <Plus className="w-4 h-4" /> Create Session
            </button>
          )}
        </div>

        {/* Session Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-4 bg-surface-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-surface-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Calendar className="w-12 h-12 text-surface-700 mx-auto mb-3" />
            <p className="text-surface-500">No sessions found</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {sessions.map((s) => {
              const coach = s.coachId as User;
              return (
                <motion.div
                  key={s._id}
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -2 }}
                  className="glass-card-hover p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(s.status)}
                      <span className={`badge ${getStatusColor(s.status)} capitalize`}>{s.status}</span>
                    </div>
                    <span className="badge badge-info">{s.sport}</span>
                  </div>

                  <h3 className="font-semibold text-surface-100 leading-tight">{s.eventName}</h3>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(s.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{s.startTime} – {s.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-400">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{s.location}</span>
                    </div>
                  </div>

                  {coach && typeof coach === "object" && (
                    <div className="flex items-center gap-2 pt-1 border-t border-surface-700/50">
                      <div className="w-6 h-6 rounded-md bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
                        {coach.name?.charAt(0)}
                      </div>
                      <span className="text-xs text-surface-400">{coach.name}</span>
                    </div>
                  )}

                  {(user?.role === "admin" || user?.role === "coach") && s.status === "scheduled" && (
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => setModal({ session: s })} className="flex-1 btn-secondary py-1.5 text-xs flex items-center justify-center gap-1" id={`edit-session-${s._id}`}>
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => handleCancel(s._id)} className="flex-1 btn-danger py-1.5 text-xs" id={`cancel-session-${s._id}`}>Cancel</button>
                      {user?.role === "admin" && (
                        <button onClick={() => handleDelete(s._id)} className="p-1.5 btn-danger" id={`delete-session-${s._id}`}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modal && (
          <SessionModal
            session={modal.session}
            coaches={coaches}
            currentCoach={user?.role === "coach" ? ({ ...user, _id: user.id || user._id } as User) : null}
            onClose={() => setModal(null)}
            onSave={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
