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
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
                        className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-64"
                    />
                </div>
                <span className="text-xs text-slate-500">{filtered.length} entries</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                {loading ? <div className="text-center py-16 text-slate-500">Loading...</div>
                    : filtered.length === 0 ? <div className="text-center py-16 text-slate-500">No activity logs yet</div>
                        : filtered.map(log => (
                            <div key={log.id} className="flex items-center gap-4 px-6 py-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-slate-300">{log.action}</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">by {log.actor_email || 'System'} · {log.entity_type} #{log.entity_id}</div>
                                </div>
                                <div className="text-[10px] text-slate-600 shrink-0">{new Date(log.created_at).toLocaleString()}</div>
                            </div>
                        ))}
            </div>
        </div>
    );
}
