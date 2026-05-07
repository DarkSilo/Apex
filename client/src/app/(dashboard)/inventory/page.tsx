"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Search, AlertTriangle, Edit2, Trash2, XCircle, History, Filter, Zap, LayoutGrid } from "lucide-react";
import Topbar from "@/components/layout/Topbar";
import api from "@/lib/api";
import { InventoryItem } from "@/types";
import { formatDate, getStatusColor } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  show: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
  exit: { opacity: 0, scale: 0.95 },
};

const emptyForm = {
  itemName: "", category: "", currentStock: 0, condition: "good" as const,
  minThreshold: 5, sport: "Cricket", description: "",
};

const CATEGORY_OPTIONS = ["Equipment", "Protective", "Footwear", "Training", "Medical", "Facility"];

interface ItemModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onSave: () => void;
}

function ItemModal({ item, onClose, onSave }: ItemModalProps) {
  const [form, setForm] = useState(item ? {
    itemName: item.itemName, category: item.category, currentStock: item.currentStock,
    condition: item.condition, minThreshold: item.minThreshold, sport: item.sport,
    description: item.description,
  } : emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (item) {
        await api.put(`/inventory/${item._id}`, form);
      } else {
        await api.post("/inventory", form);
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
        className="glass-card w-full max-w-lg p-8 border-surface-700/50" onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-black text-surface-50 tracking-tight">{item ? "Update Equipment" : "Add New Asset"}</h2>
            <p className="text-xs text-surface-500 font-bold uppercase tracking-widest mt-1">Inventory Management</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-800 rounded-xl transition-colors border border-surface-800">
            <XCircle className="w-5 h-5 text-surface-500" />
          </button>
        </div>
        {error && <div className="mb-6 p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-xs font-bold">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2">Item Name</label>
              <input name="itemName" value={form.itemName} onChange={handleChange} className="input-field py-3" placeholder="e.g. Premium Cricket Bat" required id="inv-name" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field py-3" required id="inv-category">
                <option value="">Select category...</option>
                {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2">Sport</label>
              <select name="sport" value={form.sport} onChange={handleChange} className="input-field py-3" id="inv-sport">
                {["Cricket", "Football", "Badminton"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2">Stock Level</label>
              <input name="currentStock" type="number" min={0} value={form.currentStock} onChange={handleChange} className="input-field py-3" required id="inv-stock" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2">Min Alert Threshold</label>
              <input name="minThreshold" type="number" min={0} value={form.minThreshold} onChange={handleChange} className="input-field py-3" required id="inv-threshold" />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2">Asset Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange} className="input-field py-3" id="inv-condition">
                {["new", "good", "fair", "poor"].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input-field py-3 resize-none" placeholder="Specifications, warranty, etc..." id="inv-desc" />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 font-bold">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center font-bold" id="inv-save">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : item ? "Update Asset" : "Register Item"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSport, setFilterSport] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [modal, setModal] = useState<{ item: InventoryItem | null } | null>(null);
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [alertCount, setAlertCount] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterSport) params.set("sport", filterSport);
      if (filterCondition) params.set("condition", filterCondition);
      const res = await api.get(`/inventory?${params}`);
      setItems(res.data);
      setAlertCount(res.data.filter((i: InventoryItem) => i.isLowStock || i.isOutOfStock).length);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, filterSport, filterCondition]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item permanently?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      fetchItems();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="relative min-h-screen bg-surface-950 overflow-hidden">
       {/* Background Orbs */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 -left-1/4 w-[800px] h-[800px] bg-warning-500/5 rounded-full blur-[140px]" />
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-[100px]" />
      </div>

      <Topbar title="Asset Registry" subtitle="Manage equipment and stock availability" />
      
      <div className="relative z-10 p-4 md:p-8 space-y-8 max-w-7xl mx-auto">

        {/* Hero Alert Banner */}
        <AnimatePresence>
          {alertCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -20 }}
              className="relative overflow-hidden rounded-3xl border border-warning-500/30 bg-warning-500/10 p-6 backdrop-blur-xl"
            >
               <div className="relative z-10 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-warning-500/20 border border-warning-500/20">
                      <AlertTriangle className="w-6 h-6 text-warning-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-warning-200">Attention Required</h3>
                      <p className="text-sm text-warning-400/80 font-medium">
                        {alertCount} items have reached critical stock levels. Immediate replenishment recommended.
                      </p>
                    </div>
                  </div>
                  <button onClick={fetchItems} className="px-5 py-2.5 rounded-xl bg-warning-500 text-surface-950 font-bold text-xs hover:bg-warning-400 transition-all shadow-lg shadow-warning-500/20">
                    REVIEW ALERTS
                  </button>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-warning-400/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Active Assets", value: items.length, color: "bg-brand-500", text: "text-brand-400", icon: Package },
            { label: "Critical Alerts", value: alertCount, color: "bg-warning-500", text: "text-warning-400", icon: AlertTriangle },
            { label: "Pristine Condition", value: items.filter(i => i.condition === "new").length, color: "bg-success-500", text: "text-success-400", icon: Zap },
            { label: "Needs Repair", value: items.filter(i => i.condition === "poor").length, color: "bg-danger-500", text: "text-danger-400", icon: History },
          ].map((s) => (
            <motion.div key={s.label} whileHover={{ y: -5 }} className="glass-card p-6 border-surface-800/40 relative group">
              <div className="flex items-center justify-between mb-3">
                 <div className={`p-2 rounded-lg ${s.color}/10 border border-${s.color}/20`}>
                   <s.icon className={`w-4 h-4 ${s.text}`} />
                 </div>
                 <div className="w-1.5 h-1.5 rounded-full bg-surface-800" />
              </div>
              <p className={`text-3xl font-black ${s.text} tracking-tighter`}>{s.value}</p>
              <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-900/40 p-4 rounded-3xl border border-surface-800/40 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="input-field pl-12 py-3 bg-surface-950/50" 
                placeholder="Search inventory..." 
                id="inv-search" 
              />
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-800/40 border border-surface-800">
                 <Filter className="w-3.5 h-3.5 text-surface-500" />
                 <select value={filterSport} onChange={(e) => setFilterSport(e.target.value)} className="bg-transparent border-none text-xs font-bold text-surface-300 focus:ring-0 cursor-pointer" id="inv-filter-sport">
                  <option value="">All Sports</option>
                  {["Cricket", "Football", "Badminton"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-800/40 border border-surface-800">
                 <LayoutGrid className="w-3.5 h-3.5 text-surface-500" />
                 <select value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)} className="bg-transparent border-none text-xs font-bold text-surface-300 focus:ring-0 cursor-pointer" id="inv-filter-condition">
                  <option value="">Condition</option>
                  {["new", "good", "fair", "poor"].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {user?.role === "admin" && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setModal({ item: null })} 
              className="btn-primary flex items-center gap-2 py-3 px-8 font-black text-xs tracking-widest shadow-lg shadow-brand-500/20" 
              id="add-item-btn"
            >
              <Plus className="w-4 h-4" /> REGISTER ASSET
            </motion.button>
          )}
        </div>

        {/* Table View */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="table-container border-surface-800/40 backdrop-blur-xl bg-surface-900/20 rounded-[2rem] overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-800">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">Asset Details</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">Classification</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">Volume</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">Condition</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">Status</th>
                {user?.role === "admin" && <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-800/40">
              <AnimatePresence>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(user?.role === "admin" ? 6 : 5)].map((_, j) => (
                        <td key={j} className="px-6 py-5"><div className="h-4 bg-surface-800/50 rounded-lg animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-24 text-surface-500">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">No matching assets found</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <motion.tr 
                      key={item._id} 
                      custom={i} 
                      variants={rowVariants} 
                      initial="hidden" 
                      animate="show" 
                      exit="exit" 
                      layout
                      className="group hover:bg-surface-800/20 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${item.isOutOfStock ? 'bg-danger-500/10 text-danger-400' : item.isLowStock ? 'bg-warning-500/10 text-warning-400' : 'bg-brand-500/10 text-brand-400'}`}>
                              {item.itemName?.[0]}
                           </div>
                           <div>
                              <p className="font-bold text-surface-100 group-hover:text-brand-400 transition-colors">{item.itemName}</p>
                              <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest">{item.category}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-bold text-surface-400 uppercase tracking-widest px-3 py-1 rounded-lg bg-surface-800/50 border border-surface-800">
                          {item.sport}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                           <div className="flex flex-col">
                              <span className={`text-base font-black ${item.isOutOfStock ? "text-danger-400" : item.isLowStock ? "text-warning-400" : "text-surface-100"}`}>
                                {item.currentStock}
                              </span>
                              <span className="text-[9px] text-surface-600 font-bold uppercase tracking-widest">Available</span>
                           </div>
                           <div className="w-12 h-1 rounded-full bg-surface-800 overflow-hidden">
                              <div 
                                className={`h-full ${item.isOutOfStock ? 'bg-danger-500' : item.isLowStock ? 'bg-warning-500' : 'bg-success-500'}`}
                                style={{ width: `${Math.min(100, (item.currentStock / (item.minThreshold * 2)) * 100)}%` }}
                              />
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${getStatusColor(item.condition)} bg-opacity-10 tracking-widest`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.isOutOfStock ? "bg-danger-500/10 text-danger-400" : item.isLowStock ? "bg-warning-500/10 text-warning-400" : "bg-success-500/10 text-success-400"}`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${item.isOutOfStock ? "bg-danger-400" : item.isLowStock ? "bg-warning-400" : "bg-success-400"}`} />
                           {item.isOutOfStock ? "Depleted" : item.isLowStock ? "Low Level" : "Optimum"}
                        </div>
                      </td>
                      {user?.role === "admin" && (
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setHistoryItem(item)} className="p-2.5 hover:bg-brand-500/10 rounded-xl text-surface-500 hover:text-brand-400 transition-all border border-transparent hover:border-brand-500/20" title="Usage History">
                              <History className="w-4 h-4" />
                            </button>
                            <button onClick={() => setModal({ item })} className="p-2.5 hover:bg-brand-500/10 rounded-xl text-surface-500 hover:text-brand-400 transition-all border border-transparent hover:border-brand-500/20" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item._id)} className="p-2.5 hover:bg-danger-500/10 rounded-xl text-surface-500 hover:text-danger-400 transition-all border border-transparent hover:border-danger-500/20" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </motion.div>
      </div>

      <AnimatePresence>
        {modal && <ItemModal item={modal.item} onClose={() => setModal(null)} onSave={fetchItems} />}
      </AnimatePresence>

      <AnimatePresence>
        {historyItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setHistoryItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-2xl p-8 max-h-[85vh] overflow-y-auto border-surface-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-surface-50 tracking-tight">Audit Trail</h2>
                  <p className="text-xs text-surface-500 font-bold uppercase tracking-widest mt-1">{historyItem.itemName} — Movement Logs</p>
                </div>
                <button onClick={() => setHistoryItem(null)} className="p-2 hover:bg-surface-800 rounded-xl transition-colors border border-surface-800">
                  <XCircle className="w-6 h-6 text-surface-500" />
                </button>
              </div>

              <div className="space-y-4">
                {(historyItem.usageHistory || []).length === 0 ? (
                  <div className="py-20 text-center rounded-3xl bg-surface-900/40 border border-dashed border-surface-800">
                     <History className="w-12 h-12 text-surface-800 mx-auto mb-3" />
                     <p className="text-sm font-bold text-surface-500 uppercase tracking-widest">No transaction history found</p>
                  </div>
                ) : (
                  [...(historyItem.usageHistory || [])]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry, idx) => (
                      <div key={`${entry.date}-${idx}`} className="p-5 rounded-2xl bg-surface-900/40 border border-surface-800/60 flex items-center justify-between group hover:border-brand-500/20 transition-all">
                        <div className="flex items-center gap-4">
                           <div className={`p-3 rounded-xl ${entry.type === 'in' ? 'bg-success-500/10 text-success-400' : 'bg-warning-500/10 text-warning-400'}`}>
                              <Zap className="w-4 h-4" />
                           </div>
                           <div>
                            <p className="text-sm font-bold text-surface-100 capitalize">{entry.type} stock adjustment</p>
                            <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest mt-0.5">{formatDate(entry.date)} · {entry.reason || "Operational Update"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <div className={`text-lg font-black ${entry.change >= 0 ? "text-success-400" : "text-warning-400"}`}>
                              {entry.change >= 0 ? `+${entry.change}` : entry.change}
                           </div>
                           <p className="text-[9px] text-surface-600 font-bold uppercase tracking-[0.2em]">{entry.previousStock} → {entry.newStock}</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
