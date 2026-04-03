"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Search, AlertTriangle, Edit2, Trash2, XCircle, History } from "lucide-react";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-surface-100">{item ? "Edit Item" : "Add Equipment"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-700 rounded-lg transition-colors">
            <XCircle className="w-5 h-5 text-surface-500" />
          </button>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Item Name</label>
              <input name="itemName" value={form.itemName} onChange={handleChange} className="input-field" placeholder="e.g. Cricket Bat" required id="inv-name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field" required id="inv-category">
                <option value="">Select category...</option>
                {CATEGORY_OPTIONS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Sport</label>
              <select name="sport" value={form.sport} onChange={handleChange} className="input-field" id="inv-sport">
                {["Cricket", "Football", "Badminton"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Current Stock</label>
              <input name="currentStock" type="number" min={0} value={form.currentStock} onChange={handleChange} className="input-field" required id="inv-stock" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Min Threshold</label>
              <input name="minThreshold" type="number" min={0} value={form.minThreshold} onChange={handleChange} className="input-field" required id="inv-threshold" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange} className="input-field" id="inv-condition">
                {["new", "good", "fair", "poor"].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input-field resize-none" placeholder="Optional description..." id="inv-desc" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center" id="inv-save">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : item ? "Save Changes" : "Add Item"}
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
      setAlertCount(res.data.filter((i: InventoryItem) => i.isLowStock).length);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, filterSport, filterCondition]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`/inventory/${id}`);
      fetchItems();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <Topbar title="Inventory" subtitle="Track equipment and manage stock levels" />
      <div className="p-8 space-y-6">

        {/* Alert banner */}
        {alertCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-warning-500/10 border border-warning-500/20"
          >
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <AlertTriangle className="w-5 h-5 text-warning-400" />
            </motion.div>
            <p className="text-sm text-warning-300 font-medium">
              {alertCount} item{alertCount > 1 ? "s are" : " is"} below minimum stock threshold
            </p>
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 w-60" placeholder="Search items..." id="inv-search" />
            </div>
            <select value={filterSport} onChange={(e) => setFilterSport(e.target.value)} className="input-field w-36" id="inv-filter-sport">
              <option value="">All Sports</option>
              {["Cricket", "Football", "Badminton"].map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)} className="input-field w-36" id="inv-filter-condition">
              <option value="">All Conditions</option>
              {["new", "good", "fair", "poor"].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
          </div>
          {user?.role === "admin" && (
            <button onClick={() => setModal({ item: null })} className="btn-primary flex items-center gap-2 whitespace-nowrap" id="add-item-btn">
              <Plus className="w-4 h-4" /> Add Equipment
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Items", value: items.length, color: "text-brand-400" },
            { label: "Low Stock", value: alertCount, color: "text-warning-400" },
            { label: "New Condition", value: items.filter(i => i.condition === "new").length, color: "text-success-400" },
            { label: "Poor Condition", value: items.filter(i => i.condition === "poor").length, color: "text-danger-400" },
          ].map((s) => (
            <motion.div key={s.label} whileHover={{ scale: 1.02 }} className="glass-card p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-surface-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Sport</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Min Threshold</th>
                <th>Condition</th>
                <th>Status</th>
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(8)].map((_, j) => (
                        <td key={j}><div className="h-4 bg-surface-700/50 rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-surface-500">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />No items found
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <motion.tr key={item._id} custom={i} variants={rowVariants} initial="hidden" animate="show" exit="exit" layout>
                      <td>
                        <div className="flex items-center gap-2">
                          {item.isLowStock && (
                            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                              <AlertTriangle className="w-4 h-4 text-warning-400 flex-shrink-0" />
                            </motion.div>
                          )}
                          <span className="font-medium text-surface-200">{item.itemName}</span>
                        </div>
                      </td>
                      <td><span className="text-surface-300">{item.sport}</span></td>
                      <td><span className="text-surface-400">{item.category}</span></td>
                      <td>
                        <span className={`font-bold ${item.isLowStock ? "text-warning-400" : "text-surface-200"}`}>
                          {item.currentStock}
                        </span>
                      </td>
                      <td><span className="text-surface-400">{item.minThreshold}</span></td>
                      <td><span className={`badge ${getStatusColor(item.condition)} capitalize`}>{item.condition}</span></td>
                      <td>
                        <span className={`badge ${item.isLowStock ? "badge-warning" : "badge-success"}`}>
                          {item.isLowStock ? "Low Stock" : "Sufficient"}
                        </span>
                      </td>
                      {user?.role === "admin" && (
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setHistoryItem(item)} className="p-1.5 hover:bg-surface-700 rounded-lg text-surface-400 hover:text-brand-400 transition-colors" title="Usage History" id={`history-item-${item._id}`}>
                              <History className="w-4 h-4" />
                            </button>
                            <button onClick={() => setModal({ item })} className="p-1.5 hover:bg-surface-700 rounded-lg text-surface-400 hover:text-brand-400 transition-colors" title="Edit" id={`edit-item-${item._id}`}>
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item._id)} className="p-1.5 hover:bg-danger-500/10 rounded-lg text-surface-400 hover:text-danger-400 transition-colors" title="Delete" id={`delete-item-${item._id}`}>
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
        </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setHistoryItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card w-full max-w-2xl p-6 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-surface-100">Usage History</h2>
                  <p className="text-xs text-surface-500 mt-1">{historyItem.itemName}</p>
                </div>
                <button onClick={() => setHistoryItem(null)} className="p-2 hover:bg-surface-700 rounded-lg transition-colors">
                  <XCircle className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              <div className="space-y-3">
                {(historyItem.usageHistory || []).length === 0 ? (
                  <p className="text-sm text-surface-500">No usage records yet.</p>
                ) : (
                  [...(historyItem.usageHistory || [])]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry, idx) => (
                      <div key={`${entry.date}-${idx}`} className="p-4 rounded-lg bg-surface-800/50 border border-surface-700/30">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-surface-200 capitalize">{entry.type} movement</p>
                            <p className="text-xs text-surface-500">{formatDate(entry.date)}</p>
                          </div>
                          <span className={`badge ${entry.change >= 0 ? "badge-success" : "badge-warning"}`}>
                            {entry.change >= 0 ? `+${entry.change}` : entry.change}
                          </span>
                        </div>
                        <p className="text-xs text-surface-400 mt-2">{entry.reason || "Stock update"}</p>
                        <p className="text-xs text-surface-500 mt-1">
                          Stock: {entry.previousStock} → {entry.newStock}
                        </p>
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
