'use client';
import { useEffect, useState } from 'react';
import { Building2, Users, TrendingUp, DollarSign, Activity, Zap, Trophy, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const STAT_COLORS = [
    { bg: 'bg-white border-slate-200', icon: 'text-indigo-600 bg-indigo-50', ring: 'ring-indigo-100' },
    { bg: 'bg-white border-slate-200', icon: 'text-emerald-600 bg-emerald-50', ring: 'ring-emerald-100' },
    { bg: 'bg-white border-slate-200', icon: 'text-amber-600 bg-amber-50', ring: 'ring-amber-100' },
    { bg: 'bg-white border-slate-200', icon: 'text-red-600 bg-red-50', ring: 'ring-red-100' },
    { bg: 'bg-white border-slate-200', icon: 'text-purple-600 bg-purple-50', ring: 'ring-purple-100' },
    { bg: 'bg-white border-slate-200', icon: 'text-cyan-600 bg-cyan-50', ring: 'ring-cyan-100' },
    { bg: 'bg-white border-slate-200', icon: 'text-pink-600 bg-pink-50', ring: 'ring-pink-100' },
    { bg: 'bg-white border-slate-200', icon: 'text-teal-600 bg-teal-50', ring: 'ring-teal-100' },
];

function StatCard({ label, value, icon: Icon, colorIdx = 0, suffix = '' }) {
    const c = STAT_COLORS[colorIdx % STAT_COLORS.length];
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`border rounded-2xl p-5 flex items-start gap-4 bg-white shadow-sm shadow-slate-200/50 hover:shadow-md transition-shadow`}
        >
            <div className={`w-12 h-12 rounded-xl border border-slate-100 flex items-center justify-center shrink-0 ${c.icon}`}>
                <Icon size={22} strokeWidth={2.5} />
            </div>
            <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">{suffix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</div>
                <div className="text-[10px] text-slate-400 font-black mt-0.5 uppercase tracking-widest leading-none">{label}</div>
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
            <RefreshCw size={32} className="animate-spin text-indigo-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Processing Analytics...</span>
        </div>
    );

    const stats = data?.stats || {};
    const companies = data?.companies || [];
    const activity = data?.recentActivity || [];

    const trialCompanies = companies.filter(c => c.status === 'trial');
    const activeCompanies = companies.filter(c => c.status === 'active');
    const expiredCompanies = companies.filter(c => c.status === 'expired');

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard label="Direct Companies" value={stats.totalCompanies || 0} icon={Building2} colorIdx={0} />
                <StatCard label="Active Clients" value={stats.activeSubscriptions || 0} icon={Trophy} colorIdx={1} />
                <StatCard label="Trial Funnel" value={stats.trialAccounts || 0} icon={Clock} colorIdx={2} />
                <StatCard label="Churned/Exp" value={stats.expiredAccounts || 0} icon={Zap} colorIdx={3} />
                <StatCard label="Platform Users" value={stats.totalUsers || 0} icon={Users} colorIdx={4} />
                <StatCard label="Est. MRR" value={stats.monthlyRevenue || 0} icon={DollarSign} colorIdx={1} suffix="₹" />
                <StatCard label="Pipeline Deals" value={stats.totalDeals || 0} icon={TrendingUp} colorIdx={6} />
                <StatCard label="System Events" value={activity.length} icon={Activity} colorIdx={7} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Company Status Breakdown */}
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <h2 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Activity size={14} /> Ecosystem Health
                    </h2>
                    <div className="space-y-6">
                        {[
                            { label: 'Active Subscriptions', count: activeCompanies.length, color: 'bg-emerald-500', pct: companies.length ? Math.round(activeCompanies.length / companies.length * 100) : 0 },
                            { label: 'Active Trials', count: trialCompanies.length, color: 'bg-amber-500', pct: companies.length ? Math.round(trialCompanies.length / companies.length * 100) : 0 },
                            { label: 'Expired/Inactive', count: expiredCompanies.length, color: 'bg-red-500', pct: companies.length ? Math.round(expiredCompanies.length / companies.length * 100) : 0 },
                        ].map(item => (
                            <div key={item.label}>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="font-bold text-slate-600">{item.label}</span>
                                    <span className="font-black text-slate-900">{item.pct}% ({item.count})</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.pct}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className={`h-full ${item.color} rounded-full shadow-sm`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Companies */}
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                    <h2 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Building2 size={14} /> Latest Registrations
                    </h2>
                    <div className="space-y-4">
                        {companies.slice(0, 5).map(c => (
                            <div key={c.id} className="flex items-center justify-between py-1 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-white group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
                                        {c.name?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">{c.name}</div>
                                        <div className="text-[10px] text-slate-400 font-medium tracking-tight">{c.admin_email}</div>
                                    </div>
                                </div>
                                <StatusPill status={c.status} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            {activity.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm pb-20">
                    <h2 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Clock size={14} /> Audit Trail
                    </h2>
                    <div className="space-y-4">
                        {activity.map(log => (
                            <div key={log.id} className="flex items-start gap-4 py-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 shadow-sm shadow-indigo-200" />
                                <div className="flex-1 text-sm text-slate-700 font-bold group-hover:text-slate-900">
                                    {log.action}
                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">{new Date(log.created_at).toLocaleString()}</div>
                                </div>
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
        active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        trial: 'bg-amber-50 text-amber-600 border-amber-100',
        expired: 'bg-red-50 text-red-600 border-red-100',
        suspended: 'bg-slate-50 text-slate-500 border-slate-200',
    };
    return (
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border shadow-sm ${cfg[status] || cfg.suspended}`}>
            {status}
        </span>
    );
}
