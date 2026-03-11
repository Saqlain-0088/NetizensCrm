'use client';
import { useEffect, useState } from 'react';
import { Sparkles, Check, X, Plus, Loader2, Edit2, Zap, RefreshCw, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [showCreate, setShowCreate] = useState(false);

    const fetchPlans = () => {
        setLoading(true);
        fetch('/api/superadmin/plans')
            .then(r => r.json())
            .then(d => { setPlans(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchPlans(); }, []);

    const handleSavePlan = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            id: editingPlan?.id,
            name: formData.get('name'),
            monthly_price: parseInt(formData.get('monthly_price')),
            yearly_price: parseInt(formData.get('yearly_price')),
            max_users: parseInt(formData.get('max_users')),
            max_leads: parseInt(formData.get('max_leads')),
            max_contacts: parseInt(formData.get('max_contacts')),
            support_type: formData.get('support_type'),
            // Keep existing AI flags during basic edit
            ...(editingPlan || {})
        };

        setSaving(editingPlan?.id || 'new');
        const method = editingPlan ? 'PATCH' : 'POST';
        await fetch('/api/superadmin/plans', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        setEditingPlan(null);
        setShowCreate(false);
        fetchPlans();
        setSaving(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this plan? This may affect active customers.')) return;
        setSaving(id + 'delete');
        await fetch(`/api/superadmin/plans?id=${id}`, { method: 'DELETE' });
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

    if (loading && plans.length === 0) return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <RefreshCw size={32} className="animate-spin text-indigo-600" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Synchronizing Plans...</span>
        </div>
    );

    const planColors = ['from-slate-700 to-slate-900', 'from-indigo-600 to-indigo-800', 'from-purple-600 to-purple-800'];

    return (
        <div className="space-y-8 pb-32">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">Strategic Plan Architect</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configure subscription tiers and AI feature availability</p>
                </div>
                <button
                    onClick={() => { setEditingPlan(null); setShowCreate(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95"
                >
                    <Plus size={16} strokeWidth={3} /> New Blueprint
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan, i) => (
                    <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
                    >
                        {/* Plan Header */}
                        <div className={`bg-gradient-to-br ${planColors[i % planColors.length]} p-8 text-white relative h-32`}>
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-700">
                                <Zap size={80} />
                            </div>
                            <div className="relative z-10">
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Tier Level {i + 1}</div>
                                <h3 className="font-black text-2xl tracking-tight uppercase leading-none">{plan.name}</h3>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="text-lg font-black tracking-tighter">₹{plan.monthly_price?.toLocaleString('en-IN')}</span>
                                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-widest">per unit / month</span>
                                </div>
                            </div>
                        </div>

                        {/* Plan Body */}
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <LimitMetric label="User Slots" value={plan.max_users >= 999 ? '∞' : plan.max_users} />
                                <LimitMetric label="Lead Capacity" value={plan.max_leads >= 9999 ? '∞' : plan.max_leads?.toLocaleString()} />
                                <LimitMetric label="Support Tier" value={plan.support_type} />
                                <LimitMetric label="Yearly" value={`₹${(plan.yearly_price / 1000).toFixed(1)}k`} />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={14} className="text-indigo-500" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">AI Intelligence Suite</span>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {AI_FLAGS.map(flag => (
                                        <button
                                            key={flag.key}
                                            onClick={() => handleToggleAI(plan, flag.key)}
                                            disabled={saving === plan.id + flag.key}
                                            className={clsx(
                                                "flex items-center justify-between p-3 rounded-2xl border transition-all text-left",
                                                plan[flag.key]
                                                    ? "bg-indigo-50/50 border-indigo-100 text-indigo-700"
                                                    : "bg-slate-50 border-slate-100 text-slate-400"
                                            )}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">{flag.label}</span>
                                            {saving === plan.id + flag.key ? (
                                                <RefreshCw size={12} className="animate-spin" />
                                            ) : plan[flag.key] ? (
                                                <Check size={14} strokeWidth={3} />
                                            ) : (
                                                <X size={14} strokeWidth={2} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 grid grid-cols-2 gap-3 items-center">
                                <button
                                    onClick={() => setEditingPlan(plan)}
                                    className="flex items-center justify-center gap-2 py-3.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                                >
                                    <Edit2 size={12} /> Modify
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    disabled={saving === plan.id + 'delete'}
                                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                >
                                    {saving === plan.id + 'delete' ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />} Erase
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal for Create/Edit */}
            <AnimatePresence>
                {(showCreate || editingPlan) && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden"
                        >
                            <form onSubmit={handleSavePlan}>
                                <div className="p-10 space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{editingPlan ? 'Edit Blueprint' : 'New Blueprint'}</h2>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Drafting subscription tier configuration</p>
                                        </div>
                                        <button type="button" onClick={() => { setEditingPlan(null); setShowCreate(false); }} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                                            <X size={20} strokeWidth={3} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Blueprint Title</label>
                                            <input name="name" defaultValue={editingPlan?.name} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all uppercase placeholder:text-slate-300" placeholder="e.g. Growth Pro" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Monthly Billing (₹)</label>
                                            <input name="monthly_price" type="number" defaultValue={editingPlan?.monthly_price} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Yearly Discount (₹)</label>
                                            <input name="yearly_price" type="number" defaultValue={editingPlan?.yearly_price} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">User Threshold</label>
                                            <input name="max_users" type="number" defaultValue={editingPlan?.max_users} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Level</label>
                                            <select name="support_type" defaultValue={editingPlan?.support_type || 'Standard'} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600">
                                                <option value="Standard">Standard (Email)</option>
                                                <option value="Priority">Priority (Chat)</option>
                                                <option value="Enterprise">24/7 Dedicated</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Leads Limit</label>
                                            <input name="max_leads" type="number" defaultValue={editingPlan?.max_leads || 1000} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Contacts Limit</label>
                                            <input name="max_contacts" type="number" defaultValue={editingPlan?.max_contacts || 1000} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-black focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none" required />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
                                    <button type="button" onClick={() => { setEditingPlan(null); setShowCreate(false); }} className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase text-[10px] tracking-widest">Abort Draft</button>
                                    <button type="submit" disabled={saving} className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-slate-900 transition-all uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
                                        {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                                        {editingPlan ? 'Deploy Updates' : 'Formalize Blueprint'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function LimitMetric({ label, value }) {
    return (
        <div className="bg-slate-50/80 rounded-2xl px-4 py-3 border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-all duration-300">
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-0.5 group-hover:text-indigo-400">{label}</div>
            <div className="text-xs font-black text-slate-800">{value}</div>
        </div>
    );
}

function clsx(...classes) {
    return classes.filter(Boolean).join(' ');
}
