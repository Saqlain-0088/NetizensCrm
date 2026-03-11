'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, Plus } from 'lucide-react';

const STATUS_COLORS = {
    open: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    in_progress: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    closed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
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
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500 font-medium">{tickets.filter(t => t.status === 'open').length} open tickets</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800">
                            {['Subject', 'Company', 'Priority', 'Status', 'Created', 'Action'].map(h => (
                                <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={6} className="py-16 text-center text-slate-500">Loading...</td></tr>
                            : tickets.length === 0 ? <tr><td colSpan={6} className="py-16 text-center text-slate-500">No support tickets yet</td></tr>
                                : tickets.map(t => (
                                    <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-sm text-slate-200">{t.subject}</div>
                                            {t.message && <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{t.message}</div>}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-400">{t.company_name || '—'}</td>
                                        <td className="px-5 py-4">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${t.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                                                {t.priority}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${STATUS_COLORS[t.status] || STATUS_COLORS.open}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500">{new Date(t.created_at).toLocaleDateString()}</td>
                                        <td className="px-5 py-4">
                                            {t.status === 'open' && (
                                                <button onClick={() => closeTicket(t.id)} disabled={saving === t.id}
                                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-40"
                                                >
                                                    {saving === t.id ? <RefreshCw size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                                                    Resolve
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
