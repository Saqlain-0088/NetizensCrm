'use client';
import { useEffect, useState } from 'react';
import { Sparkles, Check, X, Plus, Loader2, Edit2, Zap, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const AI_FLAGS = [
    { key: 'lead_scoring', label: 'AI Lead Scoring' },
    { key: 'email_generator', label: 'AI Email Generator' },
    { key: 'chat_assistant', label: 'AI Chat Assistant' },
    { key: 'forecasting', label: 'AI Forecasting' },
    { key: 'meeting_notes', label: 'AI Meeting Notes' },
    { key: 'smart_notifications', label: 'Smart Notifications' },
];

export default function SuperPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null);

    const fetchPlans = () => {
        fetch('/api/superadmin/plans')
            .then(r => r.json())
            .then(d => { setPlans(Array.isArray(d) ? d : []); setLoading(false); });
    };

    useEffect(() => { fetchPlans(); }, []);

    const handleSavePlan = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updated = {
            ...editingPlan,
            name: formData.get('name'),
            monthly_price: parseInt(formData.get('monthly_price')),
            yearly_price: parseInt(formData.get('yearly_price')),
            max_users: parseInt(formData.get('max_users')),
        };

        setSaving(editingPlan.id);
        await fetch('/api/superadmin/plans', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        setEditingPlan(null);
        fetchPlans();
        setSaving(null);
    };

    const handleToggleAI = async (plan, key) => {
        const updated = { ...plan, [key]: !plan[key] };
        setSaving(plan.id + key);
        await fetch('/api/superadmin/plans', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        fetchPlans();
        setSaving(null);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
            <RefreshCw size={32} className="animate-spin text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Plans...</span>
        </div>
    );

    const planColors = ['from-slate-600 to-slate-500', 'from-indigo-500 to-indigo-600', 'from-amber-500 to-amber-600'];

    return (
        <div className="space-y-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, i) => (
                    <motion.div key={plan.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                    >
                        {/* Plan Header */}
                        <div className={`bg-gradient-to-br ${planColors[i % planColors.length]} p-6 text-white relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 p-4 opacity-20"><Zap size={48} /></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="font-black text-xl tracking-tight">{plan.name}</div>
                                    <div className="text-white/80 text-[11px] font-bold uppercase tracking-wider mt-1">
                                        ₹{plan.monthly_price?.toLocaleString('en-IN')}/mo
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditingPlan(plan)}
                                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors"
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Plan Limits */}
                        <div className="p-6 border-b border-slate-100 space-y-3 bg-slate-50/30">
                            <LimitRow label="Users" value={plan.max_users >= 9999 ? 'Unlimited' : plan.max_users} />
                            <LimitRow label="Leads" value={plan.max_leads >= 9999 ? 'Unlimited' : plan.max_leads?.toLocaleString()} />
                            <LimitRow label="Support" value={plan.support_type} />
                        </div>

                        {/* AI Feature Toggles */}
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={14} className="text-indigo-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Capabilities</span>
                            </div>
                            {AI_FLAGS.map(flag => (
                                <div key={flag.key} className="flex items-center justify-between group">
                                    <span className="text-[13px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{flag.label}</span>
                                    <button
                                        onClick={() => handleToggleAI(plan, flag.key)}
                                        disabled={saving === plan.id + flag.key}
                                        className={`w-10 h-6 rounded-full relative transition-all shadow-inner ${plan[flag.key] ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                    >
                                        {saving === plan.id + flag.key ? (
                                            <Loader2 size={12} className="absolute top-1 right-1 animate-spin text-white" />
                                        ) : (
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm ${plan[flag.key] ? 'right-1' : 'left-1'}`} />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Feature Matrix */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Check size={14} /> Full Feature Comparison
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Core Feature</th>
                                {plans.map(p => (
                                    <th key={p.id} className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50/30 font-black">{p.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {AI_FLAGS.map(flag => (
                                <tr key={flag.key} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-slate-600">{flag.label}</td>
                                    {plans.map(p => (
                                        <td key={p.id} className="px-6 py-4 text-center border-l border-slate-50">
                                            {p[flag.key]
                                                ? <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center mx-auto shadow-inner"><Check size={14} className="text-emerald-600" /></div>
                                                : <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center mx-auto"><X size={14} className="text-slate-300" /></div>
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingPlan && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden">
                        <form onSubmit={handleSavePlan}>
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit {editingPlan.name} Plan</h2>
                                    <button type="button" onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-slate-900"><X size={24} /></button>
                                </div>

                                <div className="grid grid-cols-1 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Plan Name</label>
                                        <input name="name" defaultValue={editingPlan.name} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Monthly Price (₹)</label>
                                            <input name="monthly_price" type="number" defaultValue={editingPlan.monthly_price} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Yearly Price (₹)</label>
                                            <input name="yearly_price" type="number" defaultValue={editingPlan.yearly_price} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" required />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Max Users</label>
                                        <input name="max_users" type="number" defaultValue={editingPlan.max_users} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" required />
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50 border-t border-slate-200 flex gap-3">
                                <button type="button" onClick={() => setEditingPlan(null)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function LimitRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-0.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            <span className="text-xs font-black text-slate-700">{value}</span>
        </div>
    );
}
