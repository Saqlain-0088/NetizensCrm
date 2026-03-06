'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import {
  Users, DollarSign, TrendingUp, Activity,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar,
  Briefcase, Target, Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalValue: 0,
    wonValue: 0,
    avgDealSize: 0,
    recentLeads: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        const totalValue = data.reduce((acc, curr) => acc + (curr.value || 0), 0);
        const wonLeads = data.filter(d => d.status === 'Won');
        const wonValue = wonLeads.reduce((acc, curr) => acc + (curr.value || 0), 0);

        setStats({
          totalLeads: data.length,
          totalValue,
          wonValue,
          avgDealSize: data.length ? Math.round(totalValue / data.length) : 0,
          recentLeads: Array.isArray(data) ? data.slice(0, 5) : []
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const performanceData = [
    { name: 'Mon', revenue: 12400 },
    { name: 'Tue', revenue: 16800 },
    { name: 'Wed', revenue: 14200 },
    { name: 'Thu', revenue: 22100 },
    { name: 'Fri', revenue: 19500 },
    { name: 'Sat', revenue: 11000 },
    { name: 'Sun', revenue: 24000 },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium text-muted-foreground">Preparing Intelligence...</span>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden xs:flex bg-white dark:bg-slate-900 border border-border rounded-lg p-1 shadow-sm">
            <button className="px-3 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">{t('dashboard.liveView')}</button>
            <button className="px-3 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-md">{t('dashboard.archive')}</button>
          </div>
          <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/leads/new" prefetch={false}>
              <Zap size={14} className="mr-2 fill-current" /> {t('dashboard.autoCapture')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <MetricCard
          label={t('dashboard.pipelineValue')}
          value={`$${(stats.totalValue / 1000000).toFixed(2)}M`}
          change="+15.2%"
          icon={DollarSign}
        />
        <MetricCard
          label={t('dashboard.closedRevenue')}
          value={`$${(stats.wonValue / 1000).toFixed(1)}k`}
          change="+8.4%"
          icon={Target}
        />
        <MetricCard
          label={t('dashboard.openDeals')}
          value={stats.totalLeads}
          change="+4"
          icon={Briefcase}
        />
        <MetricCard
          label={t('dashboard.avgDealSize')}
          value={`$${(stats.avgDealSize / 1000).toFixed(1)}k`}
          change="+2.3%"
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Performance Chart */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold">{t('dashboard.revenueVelocity')}</CardTitle>
              <CardDescription className="text-xs font-medium">Weekly trend analysis</CardDescription>
            </div>
            <select className="bg-transparent border-0 text-xs font-bold text-indigo-600 cursor-pointer focus:ring-0">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </CardHeader>
          <CardContent className="h-[280px] w-full pl-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 700, marginBottom: '4px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#velocityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Stages */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-bold">{t('dashboard.discoveryStages')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <StageProgress label="New Leads" value={45} color="bg-indigo-500" count={12} />
            <StageProgress label="Contacted" value={65} color="bg-blue-500" count={8} />
            <StageProgress label="Qualified" value={30} color="bg-emerald-500" count={5} />
            <StageProgress label="Negotiation" value={15} color="bg-amber-500" count={2} />

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <Link href="/leads" prefetch={false} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">
                {t('dashboard.managerPipeline')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Table */}
      <Card className="border-border/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/50">
          <CardTitle className="text-base font-bold">{t('dashboard.keyOpportunities')}</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground h-8">Export CSV</Button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-muted-foreground font-semibold border-b border-border/50">
                <th className="px-6 py-3.5">{t('dashboard.companyLead')}</th>
                <th className="px-6 py-3.5 hidden sm:table-cell">{t('dashboard.phase')}</th>
                <th className="px-6 py-3.5">{t('dashboard.estValue')}</th>
                <th className="px-6 py-3.5 hidden md:table-cell">{t('dashboard.owner')}</th>
                <th className="px-6 py-3.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {stats.recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{lead.company || <span className="text-muted-foreground font-normal italic">No Company</span>}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{lead.name}</div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      <span className="font-medium">{lead.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                    ${lead.value?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                        {lead.assigned_to?.[0]}
                      </div>
                      <span className="font-medium truncate max-w-[80px]">{lead.assigned_to}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/leads/${lead.id}`} prefetch={false} className="text-muted-foreground hover:text-indigo-600 transition-colors">
                      <ArrowUpRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, change, icon: Icon }) {
  const isNegative = change.startsWith('-');
  return (
    <Card className="border-border/50 hover:border-indigo-500/20 transition-all">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
            <Icon size={18} />
          </div>
          <Badge variant={isNegative ? "destructive" : "secondary"} className={isNegative ? "bg-red-50 text-red-600 hover:bg-red-50" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-50"}>
            {isNegative ? <ArrowDownRight size={10} className="mr-0.5" /> : <ArrowUpRight size={10} className="mr-0.5" />}
            {change}
          </Badge>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}

function StageProgress({ label, value, color, count }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold">
        <span className="text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-muted-foreground">{count} deals</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}
