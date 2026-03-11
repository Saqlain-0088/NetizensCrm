'use client';
import { useEffect, useState } from 'react';
import { Search, UserX, UserCheck, RefreshCw } from 'lucide-react';

export default function SuperUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = () => {
        fetch('/api/superadmin/users').then(r => r.json()).then(d => { setUsers(Array.isArray(d) ? d : []); setLoading(false); });
    };
    useEffect(() => { fetchUsers(); }, []);

    const handleAction = async (userId, action) => {
        setActionLoading(userId + action);
        await fetch('/api/superadmin/users', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action })
        });
        fetchUsers();
        setActionLoading(null);
    };

    const filtered = users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                        className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 shadow-sm"
                    />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{filtered.length} Platform Users</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            {['User Identity', 'Access Email', 'Permission Level', 'Registration Date', 'Security Actions'].map(h => (
                                <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-20">
                                <div className="flex flex-col items-center gap-2">
                                    <RefreshCw size={24} className="animate-spin text-indigo-500" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Identifying Users...</span>
                                </div>
                            </td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-20 text-slate-400 uppercase text-[10px] font-black tracking-widest">No users found matching query</td></tr>
                        ) : filtered.map(u => (
                            <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-black shadow-inner border border-slate-200">
                                            {u.email?.[0]?.toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{u.name || 'Anonymous User'}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-xs font-medium text-slate-500">{u.email}</td>
                                <td className="px-5 py-4">
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border shadow-sm ${u.role === 'suspended' ? 'bg-red-50 text-red-600 border-red-100' : u.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-xs font-bold text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                <td className="px-5 py-4 text-right">
                                    <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {u.role !== 'suspended' ? (
                                            <button onClick={() => handleAction(u.id, 'suspend')} disabled={actionLoading === u.id + 'suspend'}
                                                className="p-2 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors disabled:opacity-40" title="Suspend Access">
                                                {actionLoading === u.id + 'suspend' ? <RefreshCw size={14} className="animate-spin" /> : <UserX size={14} />}
                                            </button>
                                        ) : (
                                            <button onClick={() => handleAction(u.id, 'activate')} disabled={actionLoading === u.id + 'activate'}
                                                className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-500 transition-colors disabled:opacity-40" title="Reactivate Access">
                                                {actionLoading === u.id + 'activate' ? <RefreshCw size={14} className="animate-spin" /> : <UserCheck size={14} />}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
