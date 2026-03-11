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

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
            <RefreshCw size={32} className="animate-spin text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing AI Modules...</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-indigo-600" />
                    <h2 className="font-black text-sm text-slate-900 uppercase tracking-widest">Global AI Engine</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium">Control the availability of intelligence modules across subscription tiers. Changes are synchronized in real-time.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                {AI_FLAGS.map(flag => (
                    <div key={flag.key} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex-1">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-black text-sm text-slate-900 tracking-tight">{flag.label}</h3>
                                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{flag.desc}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Sparkles size={18} />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50/50 flex flex-col gap-2">
                            {plans.map(plan => (
                                <div key={plan.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-sm transition-all hover:border-indigo-200">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${plan[flag.key] ? 'bg-emerald-500 pulse-green' : 'bg-slate-300'}`} />
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{plan.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(plan, flag.key)}
                                        disabled={saving === plan.id + flag.key}
                                        className={`w-12 h-6 rounded-full relative transition-all ${plan[flag.key] ? 'bg-indigo-600 shadow-sm shadow-indigo-200' : 'bg-slate-200 shadow-inner'}`}
                                    >
                                        {saving === plan.id + flag.key ? (
                                            <RefreshCw size={12} className="absolute top-1 right-1 animate-spin text-white" />
                                        ) : (
                                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${plan[flag.key] ? 'right-0.5' : 'left-0.5'}`} />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
