'use client';
import { useEffect, useState } from 'react';
import { Sparkles, Check, X, Plus, Loader2, Edit2 } from 'lucide-react';
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

    const fetchPlans = () => {
        fetch('/api/superadmin/plans')
            .then(r => r.json())
            .then(d => { setPlans(Array.isArray(d) ? d : []); setLoading(false); });
    };

    useEffect(() => { fetchPlans(); }, []);

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

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

    const planColors = ['from-slate-700 to-slate-600', 'from-indigo-600 to-purple-600', 'from-amber-500 to-orange-600'];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, i) => (
                    <motion.div key={plan.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
                    >
                        {/* Plan Header */}
                        <div className={`bg-gradient-to-r ${planColors[i % planColors.length]} p-6`}>
                            <div className="text-white font-black text-lg mb-1">{plan.name}</div>
                            <div className="text-white/70 text-xs font-medium">
                                ₹{plan.monthly_price?.toLocaleString('en-IN')}/mo · ₹{plan.yearly_price?.toLocaleString('en-IN')}/yr
                            </div>
                        </div>

                        {/* Plan Limits */}
                        <div className="p-5 border-b border-slate-800 space-y-2">
                            <LimitRow label="Max Users" value={plan.max_users >= 9999 ? 'Unlimited' : plan.max_users} />
                            <LimitRow label="Max Leads" value={plan.max_leads >= 9999 ? 'Unlimited' : plan.max_leads?.toLocaleString()} />
                            <LimitRow label="Max Contacts" value={plan.max_contacts >= 9999 ? 'Unlimited' : plan.max_contacts?.toLocaleString()} />
                            <LimitRow label="Storage" value={`${plan.storage_gb} GB`} />
                            <LimitRow label="Support" value={plan.support_type} />
                            <LimitRow label="API Access" value={plan.api_access ? '✓' : '✗'} highlight={plan.api_access} />
                        </div>

                        {/* AI Feature Toggles */}
                        <div className="p-5 space-y-3">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={13} className="text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Features</span>
                            </div>
                            {AI_FLAGS.map(flag => (
                                <div key={flag.key} className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-300">{flag.label}</span>
                                    <button
                                        onClick={() => handleToggleAI(plan, flag.key)}
                                        disabled={saving === plan.id + flag.key}
                                        className={`w-10 h-5 rounded-full relative transition-all ${plan[flag.key] ? 'bg-indigo-600' : 'bg-slate-700'}`}
                                    >
                                        {saving === plan.id + flag.key ? (
                                            <Loader2 size={10} className="absolute top-0.5 right-0.5 animate-spin text-white" />
                                        ) : (
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${plan[flag.key] ? 'right-0.5' : 'left-0.5'}`} />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Feature Matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800">
                    <h2 className="font-black text-sm uppercase tracking-widest text-slate-300">Feature Matrix</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Feature</th>
                                {plans.map(p => (
                                    <th key={p.id} className="px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{p.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {AI_FLAGS.map(flag => (
                                <tr key={flag.key} className="border-b border-slate-800/50">
                                    <td className="px-6 py-3 text-sm font-medium text-slate-300">{flag.label}</td>
                                    {plans.map(p => (
                                        <td key={p.id} className="px-6 py-3 text-center">
                                            {p[flag.key]
                                                ? <Check size={16} className="text-emerald-400 mx-auto" />
                                                : <X size={16} className="text-slate-600 mx-auto" />
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function LimitRow({ label, value, highlight }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500">{label}</span>
            <span className={`text-[11px] font-bold ${highlight ? 'text-emerald-400' : 'text-slate-300'}`}>{value}</span>
        </div>
    );
}
