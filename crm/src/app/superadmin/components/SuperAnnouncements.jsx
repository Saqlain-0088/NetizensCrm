'use client';
import { useState, useEffect } from 'react';
import { Megaphone, Plus, X, Loader2, ToggleLeft, ToggleRight, RefreshCw, Sparkles, Check, Edit2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_COLORS = {
    info: 'bg-blue-50 text-blue-600 border-blue-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    error: 'bg-red-50 text-red-600 border-red-100',
};

export default function SuperAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', message: '', type: 'info' });
    const [saving, setSaving] = useState(false);

    const fetchAnnouncements = () => {
        fetch('/api/superadmin/announcements').then(r => r.json()).then(d => { setAnnouncements(Array.isArray(d) ? d : []); setLoading(false); });
    };
    useEffect(() => { fetchAnnouncements(); }, []);

    const handleCreate = async () => {
        if (!formData.title || !formData.message) return;
        setSaving(true);
        await fetch('/api/superadmin/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setFormData({ title: '', message: '', type: 'info' });
        setShowForm(false);
        fetchAnnouncements();
        setSaving(false);
    };

    const handleToggle = async (id, is_active) => {
        await fetch('/api/superadmin/announcements', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_active: !is_active })
        });
        fetchAnnouncements();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-md shadow-indigo-100 hover:shadow-lg active:scale-95"
                >
                    <Plus size={16} strokeWidth={3} /> {showForm ? 'Discard Draft' : 'Broadcast Message'}
                </button>
            </div>

            {/* Create Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white border border-indigo-200 rounded-3xl p-8 space-y-5 shadow-xl shadow-indigo-50"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Megaphone size={16} className="text-indigo-600" />
                            <h3 className="font-black text-xs text-slate-900 uppercase tracking-widest">Global Broadcast Suite</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-3">
                                <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Headline (e.g. 🛠️ Scheduled Maintenance on Sunday)"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-sans"
                                />
                            </div>
                            <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 focus:outline-none focus:border-indigo-500"
                            >
                                <option value="info">General Info</option>
                                <option value="success">Feature Drop</option>
                                <option value="warning">System Alert</option>
                                <option value="error">Critical Patch</option>
                            </select>
                        </div>
                        <textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                            placeholder="Type your detailed message here. Be clear and concise. This will be visible to all organization admins logged into the platform."
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-600 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 resize-none leading-relaxed"
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">Cancel</button>
                            <button onClick={handleCreate} disabled={saving}
                                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-indigo-100"
                            >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Megaphone size={14} />} Execute Broadcast
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center py-20 gap-2">
                        <RefreshCw size={24} className="animate-spin text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching Broadcast History...</span>
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="bg-white border border-slate-200 border-dashed rounded-3xl py-20 text-center">
                        <Megaphone size={32} className="mx-auto text-slate-200 mb-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No announcements found in archives</span>
                    </div>
                ) : announcements.map(a => (
                    <div key={a.id} className={`bg-white border border-slate-200 rounded-[2rem] p-6 flex items-start gap-5 transition-all hover:border-indigo-200 shadow-sm ${!a.is_active ? 'bg-slate-50/50 grayscale' : ''}`}>
                        <div className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border shrink-0 shadow-sm ${TYPE_COLORS[a.type] || TYPE_COLORS.info}`}>
                            {a.type}
                        </div>
                        <div className="flex-1">
                            <div className="font-black text-sm text-slate-900 mb-1">{a.title}</div>
                            <div className="text-sm text-slate-500 font-medium leading-relaxed">{a.message}</div>
                            <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Plus size={10} /> Dispatched on {new Date(a.created_at).toLocaleString()}
                            </div>
                        </div>
                        <button onClick={() => handleToggle(a.id, a.is_active)} title={a.is_active ? 'Immediate Retraction' : 'Republish Message'}
                            className="group flex flex-col items-center gap-1 mt-1"
                        >
                            {a.is_active ? (
                                <ToggleRight size={32} className="text-indigo-600 drop-shadow-sm transition-transform active:scale-90" />
                            ) : (
                                <ToggleLeft size={32} className="text-slate-300 transition-transform active:scale-90" />
                            )}
                            <span className="text-[8px] font-black uppercase text-slate-400">{a.is_active ? 'LIVE' : 'IDLE'}</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
