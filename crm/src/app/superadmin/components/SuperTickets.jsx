'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, Plus } from 'lucide-react';

const STATUS_COLORS = {
    open: 'bg-amber-50 text-amber-600 border-amber-100',
    in_progress: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    resolved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    closed: 'bg-slate-50 text-slate-500 border-slate-200',
};

export default function SuperTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);

    const fetchTickets = () => {
        fetch('/api/superadmin/tickets').then(r => r.json()).then(d => { setTickets(Array.isArray(d) ? d : []); setLoading(false); });
    };
    useEffect(() => { fetchTickets(); }, []);

    const closeTicket = async (id) => {
        setSaving(id);
        await fetch('/api/superadmin/tickets', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketId: id, status: 'resolved', assigned_to: 'Super Admin' })
        });
        fetchTickets();
        setSaving(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {tickets.filter(t => t.status === 'open').length} Active Enquiries Requiring Attention
                </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                {['Issue Description', 'Organization', 'Severity', 'Lifecycle', 'Logged At', 'Command'].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCw size={24} className="animate-spin text-indigo-500" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Polling Support Servers...</span>
                                    </div>
                                </td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan={6} className="py-20 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">No active support tickets in queue</td></tr>
                            ) : tickets.map(t => (
                                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-5 py-5">
                                        <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{t.subject}</div>
                                        {t.message && <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 italic font-medium">&quot;{t.message}&quot;</div>}
                                    </td>
                                    <td className="px-5 py-5 text-xs font-bold text-slate-500 uppercase tracking-tight">{t.company_name || 'Generic Client'}</td>
                                    <td className="px-5 py-5">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border shadow-sm ${t.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border shadow-sm ${STATUS_COLORS[t.status] || STATUS_COLORS.open}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 text-xs font-bold text-slate-400">{new Date(t.created_at).toLocaleDateString()}</td>
                                    <td className="px-5 py-5">
                                        {t.status === 'open' ? (
                                            <button onClick={() => closeTicket(t.id)} disabled={saving === t.id}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-100 transition-all disabled:opacity-40 shadow-sm"
                                            >
                                                {saving === t.id ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                                Resolve
                                            </button>
                                        ) : (
                                            <div className="text-[10px] font-black text-slate-300 uppercase italic">Handled</div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
