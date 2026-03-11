'use client';
import { useEffect, useState } from 'react';
import { Megaphone, Plus, X, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TYPE_COLORS = {
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
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
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                >
                    <Plus size={14} /> New Announcement
                </button>
            </div>

            {/* Create Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 space-y-4"
                    >
                        <h3 className="font-black text-sm text-slate-200 uppercase tracking-widest">New Announcement</h3>
                        <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                            placeholder="Title (e.g. 🚀 New Feature!)"
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <textarea value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                            placeholder="Message to all users..."
                            rows={3}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                        <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="info">Info</option>
                            <option value="success">Success</option>
                            <option value="warning">Warning</option>
                            <option value="error">Alert</option>
                        </select>
                        <div className="flex gap-3">
                            <button onClick={handleCreate} disabled={saving}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={13} className="animate-spin" /> : <Megaphone size={13} />} Send
                            </button>
                            <button onClick={() => setShowForm(false)} className="px-5 py-2 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-700 transition-all">Cancel</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List */}
            <div className="space-y-3">
                {loading ? <div className="text-center py-16 text-slate-500">Loading...</div>
                    : announcements.length === 0 ? <div className="text-center py-16 text-slate-500">No announcements yet</div>
                        : announcements.map(a => (
                            <div key={a.id} className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-start gap-4 ${!a.is_active ? 'opacity-50' : ''}`}>
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border shrink-0 mt-0.5 ${TYPE_COLORS[a.type] || TYPE_COLORS.info}`}>
                                    {a.type}
                                </span>
                                <div className="flex-1">
                                    <div className="font-bold text-sm text-slate-200">{a.title}</div>
                                    <div className="text-xs text-slate-400 mt-1">{a.message}</div>
                                    <div className="text-[10px] text-slate-600 mt-2">{new Date(a.created_at).toLocaleString()}</div>
                                </div>
                                <button onClick={() => handleToggle(a.id, a.is_active)} title={a.is_active ? 'Deactivate' : 'Activate'}
                                    className="text-slate-400 hover:text-indigo-400 transition-colors"
                                >
                                    {a.is_active ? <ToggleRight size={22} className="text-indigo-400" /> : <ToggleLeft size={22} />}
                                </button>
                            </div>
                        ))}
            </div>
        </div>
    );
}
