'use client';
import { useEffect, useState } from 'react';
import { Sparkles, Check, X, RefreshCw } from 'lucide-react';

const AI_FLAGS = [
    { key: 'lead_scoring', label: 'AI Lead Scoring', desc: 'Score leads automatically using AI based on their behaviour and data' },
    { key: 'email_generator', label: 'AI Email Generator', desc: 'Generate personalized follow-up emails for leads using GPT' },
    { key: 'chat_assistant', label: 'AI Chat Assistant', desc: 'Enable the floating AI chatbot assistant in the CRM sidebar' },
    { key: 'forecasting', label: 'AI Sales Forecasting', desc: 'Forecast revenue and pipeline using AI-driven predictions' },
    { key: 'meeting_notes', label: 'AI Meeting Notes', desc: 'Summarize audio recordings and create smart action items' },
    { key: 'smart_notifications', label: 'Smart Notifications', desc: 'AI-driven alerts for inactive leads and follow-up reminders' },
];

export default function SuperAIControls() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);

    const fetchPlans = () => {
        fetch('/api/superadmin/plans').then(r => r.json()).then(d => { setPlans(Array.isArray(d) ? d : []); setLoading(false); });
    };
    useEffect(() => { fetchPlans(); }, []);

    const handleToggle = async (plan, key) => {
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

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-indigo-400" />
                    <h2 className="font-black text-sm text-slate-200 uppercase tracking-widest">AI Feature Control</h2>
                </div>
                <p className="text-xs text-slate-500">Enable or disable individual AI features per plan. Changes take effect immediately.</p>
            </div>

            {AI_FLAGS.map(flag => (
                <div key={flag.key} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <div className="mb-4">
                        <h3 className="font-black text-sm text-slate-200">{flag.label}</h3>
                        <p className="text-[11px] text-slate-500 mt-1">{flag.desc}</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {plans.map(plan => (
                            <div key={plan.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${plan[flag.key] ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
                                <span className="text-sm font-bold text-slate-300 min-w-[80px]">{plan.name}</span>
                                <button
                                    onClick={() => handleToggle(plan, flag.key)}
                                    disabled={saving === plan.id + flag.key}
                                    className={`w-12 h-6 rounded-full relative transition-all ${plan[flag.key] ? 'bg-indigo-600' : 'bg-slate-600'}`}
                                >
                                    {saving === plan.id + flag.key ? (
                                        <RefreshCw size={10} className="absolute top-1 left-1 animate-spin text-white" />
                                    ) : (
                                        <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow ${plan[flag.key] ? 'right-0.5' : 'left-0.5'}`} />
                                    )}
                                </button>
                                {plan[flag.key]
                                    ? <Check size={14} className="text-emerald-400" />
                                    : <X size={14} className="text-slate-600" />
                                }
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
