'use client';
import { useEffect, useState } from 'react';
import { Search, Plus, MoreHorizontal, Building2, Trash2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

function StatusPill({ status }) {
    const cfg = {
        active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        trial: 'bg-amber-50 text-amber-600 border-amber-100',
        expired: 'bg-red-50 text-red-600 border-red-100',
        suspended: 'bg-slate-50 text-slate-500 border-slate-200',
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
        const matchSearch = (c.name || '').toLowerCase().includes(search.toLowerCase()) || (c.admin_email || '').toLowerCase().includes(search.toLowerCase());
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
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search companies..."
                            className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 shadow-sm"
                        />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                    >
                        <option value="All">All Status</option>
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="expired">Expired</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">{filtered.length} Companies</div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                {['Company', 'Admin', 'Plan', 'Expiry', 'Users', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCw size={24} className="animate-spin text-indigo-500" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching Data...</span>
                                    </div>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-2">
                                        <Building2 size={24} className="text-slate-200" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">No companies found</span>
                                    </div>
                                </td></tr>
                            ) : filtered.map(c => (
                                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm shadow-indigo-200">
                                                {c.name?.[0] || 'C'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-slate-900">{c.name}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{c.phone || 'No Phone'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-sm font-bold text-slate-700">{c.admin_name || '—'}</div>
                                        <div className="text-[10px] text-slate-400 font-medium tracking-tight">{c.admin_email}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs font-black text-indigo-600 tracking-tight">{c.plan_name || 'FREE TRIAL'}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-xs font-bold text-slate-600">
                                            {c.trial_ends_at ? new Date(c.trial_ends_at).toLocaleDateString() : '—'}
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-medium">Auto-renew OFF</div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-900 font-black">{c.user_count || 0}</td>
                                    <td className="px-5 py-4"><StatusPill status={c.status} /></td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {c.status !== 'active' && (
                                                <ActionBtn icon={CheckCircle} label="Activate" color="text-emerald-500" onClick={() => handleAction(c.id, 'active')} loading={actionLoading === c.id + 'active'} />
                                            )}
                                            {c.status !== 'suspended' && (
                                                <ActionBtn icon={XCircle} label="Suspend" color="text-amber-500" onClick={() => handleAction(c.id, 'suspended')} loading={actionLoading === c.id + 'suspended'} />
                                            )}
                                            <ActionBtn icon={Clock} label="+7 days" color="text-sky-500" onClick={() => handleAction(c.id, c.status, { extend_trial_days: 7 })} loading={false} />
                                            <ActionBtn icon={Trash2} label="Delete" color="text-red-500" onClick={() => handleDelete(c.id)} loading={actionLoading === c.id + 'delete'} />
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
            className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${color} disabled:opacity-40`}
        >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Icon size={14} />}
        </button>
    );
}
