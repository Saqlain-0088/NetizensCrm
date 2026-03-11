'use client';
import { useEffect, useState } from 'react';
import { Building2, Users, TrendingUp, DollarSign, Activity, Zap, Trophy, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const STAT_COLORS = [
    { bg: 'bg-indigo-500/10 border-indigo-500/20', icon: 'text-indigo-400', ring: 'ring-indigo-500/20' },
    { bg: 'bg-emerald-500/10 border-emerald-500/20', icon: 'text-emerald-400', ring: 'ring-emerald-500/20' },
    { bg: 'bg-amber-500/10 border-amber-500/20', icon: 'text-amber-400', ring: 'ring-amber-500/20' },
    { bg: 'bg-red-500/10 border-red-500/20', icon: 'text-red-400', ring: 'ring-red-500/20' },
    { bg: 'bg-purple-500/10 border-purple-500/20', icon: 'text-purple-400', ring: 'ring-purple-500/20' },
    { bg: 'bg-cyan-500/10 border-cyan-500/20', icon: 'text-cyan-400', ring: 'ring-cyan-500/20' },
    { bg: 'bg-pink-500/10 border-pink-500/20', icon: 'text-pink-400', ring: 'ring-pink-500/20' },
    { bg: 'bg-teal-500/10 border-teal-500/20', icon: 'text-teal-400', ring: 'ring-teal-500/20' },
];

function StatCard({ label, value, icon: Icon, colorIdx = 0, suffix = '' }) {
    const c = STAT_COLORS[colorIdx % STAT_COLORS.length];
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-2xl p-5 flex items-start gap-4 ${c.bg}`}
        >
            <div className={`w-11 h-11 rounded-xl border ${c.bg} flex items-center justify-center shrink-0`}>
                <Icon size={20} className={c.icon} />
            </div>
            <div>
                <div className="text-2xl font-black text-slate-100">{suffix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</div>
                <div className="text-xs text-slate-400 font-bold mt-0.5 uppercase tracking-widest">{label}</div>
            </div>
        </motion.div>
    );
}

export default function SuperDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/superadmin/dashboard')
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

    const stats = data?.stats || {};
    const companies = data?.companies || [];
    const activity = data?.recentActivity || [];

    const trialCompanies = companies.filter(c => c.status === 'trial');
    const activeCompanies = companies.filter(c => c.status === 'active');
    const expiredCompanies = companies.filter(c => c.status === 'expired');

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Companies" value={stats.totalCompanies || 0} icon={Building2} colorIdx={0} />
                <StatCard label="Active Subs" value={stats.activeSubscriptions || 0} icon={Trophy} colorIdx={1} />
                <StatCard label="Trial Accounts" value={stats.trialAccounts || 0} icon={Clock} colorIdx={2} />
                <StatCard label="Expired" value={stats.expiredAccounts || 0} icon={Zap} colorIdx={3} />
                <StatCard label="Total Users" value={stats.totalUsers || 0} icon={Users} colorIdx={4} />
                <StatCard label="Monthly Revenue" value={stats.monthlyRevenue || 0} icon={DollarSign} colorIdx={1} suffix="₹" />
                <StatCard label="Total Deals" value={stats.totalDeals || 0} icon={TrendingUp} colorIdx={6} />
                <StatCard label="Activity Logs" value={activity.length} icon={Activity} colorIdx={7} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company Status Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="font-black text-sm uppercase tracking-widest text-slate-300 mb-5">Company Status</h2>
                    <div className="space-y-3">
                        {[
                            { label: 'Active', count: activeCompanies.length, color: 'bg-emerald-500', pct: companies.length ? Math.round(activeCompanies.length / companies.length * 100) : 0 },
                            { label: 'Trial', count: trialCompanies.length, color: 'bg-amber-400', pct: companies.length ? Math.round(trialCompanies.length / companies.length * 100) : 0 },
                            { label: 'Expired', count: expiredCompanies.length, color: 'bg-red-500', pct: companies.length ? Math.round(expiredCompanies.length / companies.length * 100) : 0 },
                        ].map(item => (
                            <div key={item.label}>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="font-bold text-slate-300">{item.label}</span>
                                    <span className="font-black text-slate-100">{item.count}</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.pct}%` }}
                                        transition={{ duration: 0.8 }}
                                        className={`h-full ${item.color} rounded-full`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Companies */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="font-black text-sm uppercase tracking-widest text-slate-300 mb-5">Recent Companies</h2>
                    <div className="space-y-3">
                        {companies.slice(0, 5).map(c => (
                            <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                                <div>
                                    <div className="font-bold text-sm text-slate-200">{c.name}</div>
                                    <div className="text-[10px] text-slate-500">{c.admin_email}</div>
                                </div>
                                <StatusPill status={c.status} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            {activity.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h2 className="font-black text-sm uppercase tracking-widest text-slate-300 mb-5">Recent Activity</h2>
                    <div className="space-y-2">
                        {activity.map(log => (
                            <div key={log.id} className="flex items-center gap-4 py-2 border-b border-slate-800/60 last:border-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                <div className="flex-1 text-xs text-slate-300 font-medium">{log.action}</div>
                                <div className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

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
