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
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
                        className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-64"
                    />
                </div>
                <span className="text-xs text-slate-500">{filtered.length} users</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800">
                            {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                                <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={5} className="text-center py-16 text-slate-500">Loading...</td></tr>
                            : filtered.map(u => (
                                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
                                                {u.email?.[0]?.toUpperCase()}
                                            </div>
                                            <span className="text-sm font-bold text-slate-200">{u.name || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-400">{u.email}</td>
                                    <td className="px-5 py-4">
                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${u.role === 'suspended' ? 'bg-red-500/20 text-red-400 border-red-500/30' : u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {u.role !== 'suspended' ? (
                                                <button onClick={() => handleAction(u.id, 'suspend')} disabled={actionLoading === u.id + 'suspend'}
                                                    className="p-1.5 rounded-lg hover:bg-slate-700 text-amber-400 transition-colors disabled:opacity-40" title="Suspend">
                                                    {actionLoading === u.id + 'suspend' ? <RefreshCw size={13} className="animate-spin" /> : <UserX size={13} />}
                                                </button>
                                            ) : (
                                                <button onClick={() => handleAction(u.id, 'activate')} disabled={actionLoading === u.id + 'activate'}
                                                    className="p-1.5 rounded-lg hover:bg-slate-700 text-emerald-400 transition-colors disabled:opacity-40" title="Activate">
                                                    {actionLoading === u.id + 'activate' ? <RefreshCw size={13} className="animate-spin" /> : <UserCheck size={13} />}
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
