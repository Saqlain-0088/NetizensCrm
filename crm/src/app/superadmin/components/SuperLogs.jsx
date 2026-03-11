'use client';
import { useEffect, useState } from 'react';
import { Activity, Search } from 'lucide-react';

export default function SuperLogs() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/superadmin/dashboard').then(r => r.json()).then(d => {
            setLogs(d?.recentActivity || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filtered = logs.filter(l => l.action?.toLowerCase().includes(search.toLowerCase()) || l.actor_email?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search audit trail..."
                        className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 shadow-sm"
                    />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{filtered.length} Indexed Events</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex flex-col items-center py-20 gap-2">
                        <Activity size={24} className="animate-spin text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Querying System Logs...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">No matching activities found</div>
                ) : filtered.map(log => (
                    <div key={log.id} className="flex items-center gap-4 px-8 py-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 shadow-sm shadow-indigo-200 group-hover:scale-125 transition-transform" />
                        <div className="flex-1">
                            <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{log.action}</div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1 font-medium italic">
                                <span>via {log.actor_email || 'Autonomous System'}</span>
                                <span className="text-slate-300">•</span>
                                <span className="font-bold uppercase tracking-wider text-slate-400">{log.entity_type} #{log.entity_id}</span>
                            </div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{new Date(log.created_at).toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
