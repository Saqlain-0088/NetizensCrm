'use client';
import { useEffect, useState } from 'react';
import { Search, Plus, MoreHorizontal, Building2, Trash2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

function StatusPill({ status }) {
    const cfg = {
        active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        trial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        expired: 'bg-red-500/20 text-red-400 border-red-500/30',
        suspended: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return (
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${cfg[status] || cfg.suspended}`}>
            {status}
        </span>
    );
}

export default function SuperCompanies() {
    const [companies, setCompanies] = useState([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchCompanies = () => {
        fetch('/api/superadmin/companies')
            .then(r => r.json())
            .then(d => { setCompanies(Array.isArray(d) ? d : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchCompanies(); }, []);

    const filtered = companies.filter(c => {
        const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.admin_email?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'All' || c.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleAction = async (id, action, extra = {}) => {
        setActionLoading(id + action);
        await fetch(`/api/superadmin/companies/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: action, ...extra })
        });
        fetchCompanies();
        setActionLoading(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this company permanently?')) return;
        setActionLoading(id + 'delete');
        await fetch(`/api/superadmin/companies/${id}`, { method: 'DELETE' });
        fetchCompanies();
        setActionLoading(null);
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search companies..."
                            className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-64"
                        />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="All">All Status</option>
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="expired">Expired</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
                <div className="text-xs text-slate-500 font-medium">{filtered.length} companies</div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/50">
                                {['Company', 'Admin', 'Plan', 'Users', 'Status', 'Created', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-16 text-slate-500">Loading...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-16 text-slate-500">No companies found</td></tr>
                            ) : filtered.map(c => (
                                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
                                                {c.name?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-slate-200">{c.name}</div>
                                                <div className="text-[10px] text-slate-500">{c.phone || '—'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-sm font-medium text-slate-300">{c.admin_name || '—'}</div>
                                        <div className="text-[10px] text-slate-500">{c.admin_email}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs font-bold text-indigo-400">{c.plan_name || 'No Plan'}</span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-300 font-bold">{c.user_count}</td>
                                    <td className="px-5 py-4"><StatusPill status={c.status} /></td>
                                    <td className="px-5 py-4 text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {c.status !== 'active' && (
                                                <ActionBtn icon={CheckCircle} label="Activate" color="text-emerald-400" onClick={() => handleAction(c.id, 'active')} loading={actionLoading === c.id + 'active'} />
                                            )}
                                            {c.status !== 'suspended' && (
                                                <ActionBtn icon={XCircle} label="Suspend" color="text-amber-400" onClick={() => handleAction(c.id, 'suspended')} loading={actionLoading === c.id + 'suspended'} />
                                            )}
                                            <ActionBtn icon={Clock} label="+7 days" color="text-blue-400" onClick={() => handleAction(c.id, c.status, { extend_trial_days: 7 })} loading={false} />
                                            <ActionBtn icon={Trash2} label="Delete" color="text-red-400" onClick={() => handleDelete(c.id)} loading={actionLoading === c.id + 'delete'} />
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ActionBtn({ icon: Icon, label, color, onClick, loading }) {
    return (
        <button onClick={onClick} title={label} disabled={loading}
            className={`p-1.5 rounded-lg hover:bg-slate-700 transition-colors ${color} disabled:opacity-40`}
        >
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Icon size={13} />}
        </button>
    );
}
