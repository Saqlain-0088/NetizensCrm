'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import {
  Users, DollarSign, TrendingUp, Activity,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar,
  Briefcase, Target, Zap, Search, Bell, Loader2, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';

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
  const [fetchError, setFetchError] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 8000);

    fetch('/api/leads', { credentials: 'same-origin' })
      .then(async (res) => {
        const text = await res.text();
        let data;
        try {
          data = text ? JSON.parse(text) : [];
        } catch {
          if (res.status === 307 || res.status === 302) throw new Error('Session expired. Please sign in again.');
          throw new Error('Server returned invalid response. Check DATABASE_URL in .env.local');
        }
        if (!res.ok) {
          throw new Error(data?.error || `Request failed (${res.status})`);
        }
        return data;
      })
      .then(data => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        const totalValue = rows.reduce((acc, curr) => acc + (curr.value || 0), 0);
        const wonLeads = rows.filter(d => d.status === 'Won');
        const wonValue = wonLeads.reduce((acc, curr) => acc + (curr.value || 0), 0);

        setStats({
          totalLeads: rows.length,
          totalValue,
          wonValue,
          avgDealSize: rows.length ? Math.round(totalValue / rows.length) : 0,
          recentLeads: rows.slice(0, 5)
        });

        // Fetch AI Forecast
        fetch('/api/ai/forecast')
          .then(r => r.json())
          .then(data => {
            if (!data.error) setForecast(data);
            setLoadingForecast(false);
          })
          .catch(() => setLoadingForecast(false));

      })
      .catch(err => {
        if (!cancelled) {
          console.error('Dashboard fetch error:', err);
          setFetchError(err?.message || 'Failed to load data. Check DATABASE_URL.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
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
    <div className="flex items-center justify-center min-h-[60vh] w-full p-8 bg-slate-50 dark:bg-slate-950/20">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium text-muted-foreground">Loading dashboard...</span>
        <p className="text-xs text-muted-foreground/70 text-center">If this takes too long, check your connection.</p>
      </div>
    </div>
  );

  if (fetchError) return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
      <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6 mb-6">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">{fetchError}</p>
        <p className="text-xs text-amber-700 dark:text-amber-300 mb-4">
          {fetchError.includes('Session') ? 'Your session may have expired.' : 'Ensure DATABASE_URL is set in .env.local and PostgreSQL is running.'}
        </p>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
            Sign In
          </Link>
          <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg border border-amber-300 dark:border-amber-700 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30">
            Retry
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Showing dashboard with sample data for demo.</p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50"><CardContent className="p-5"><p className="text-[10px] font-bold text-muted-foreground uppercase">Pipeline Value</p><h3 className="text-2xl font-black">$0</h3></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-5"><p className="text-[10px] font-bold text-muted-foreground uppercase">Closed Revenue</p><h3 className="text-2xl font-black">$0</h3></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-5"><p className="text-[10px] font-bold text-muted-foreground uppercase">Open Deals</p><h3 className="text-2xl font-black">0</h3></CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-5"><p className="text-[10px] font-bold text-muted-foreground uppercase">Avg Deal Size</p><h3 className="text-2xl font-black">$0</h3></CardContent></Card>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Modern Top Header Bar */}
      <PageHeader
        title={t('dashboard.title', 'Executive Overview')}
        subtitle={t('dashboard.subtitle', 'Real-time revenue & pipeline metrics')}
        searchPlaceholder="Search leads, contacts..."
      >
        <Button asChild className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:-translate-y-0.5 transition-all font-bold">
          <Link href="/leads/new">
            <Zap size={16} className="mr-2 fill-current opacity-80" /> {t('dashboard.autoCapture', 'Auto Capture')}
          </Link>
        </Button>
      </PageHeader>

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

      <div className="grid grid-cols-1 mb-6">
        {/* AI Forecast Widget */}
        <Card className="border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm relative overflow-hidden group w-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <CardContent className="p-5 flex flex-col justify-center h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-indigo-600 text-white flex items-center justify-center shrink-0">
                {loadingForecast ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              </div>
              <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">AI Revenue Forecast</p>
            </div>
            {loadingForecast ? (
              <div className="animate-pulse flex gap-4 mt-2">
                <div className="h-8 w-32 bg-indigo-200/50 dark:bg-indigo-800/30 rounded"></div>
                <div className="h-8 flex-1 bg-indigo-200/20 dark:bg-indigo-800/20 rounded"></div>
              </div>
            ) : forecast ? (
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between mt-1 border-t border-indigo-200/50 dark:border-indigo-800/30 pt-3">
                <div>
                  <h3 className="text-3xl font-black text-indigo-900 dark:text-indigo-100">${forecast.expectedRevenue.toLocaleString()}</h3>
                  <p className="text-[10px] font-bold text-indigo-600/70 mt-1 uppercase tracking-wider">Confidence: {forecast.confidence}</p>
                </div>
                <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300 leading-relaxed sm:max-w-[70%] bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                  "{forecast.analysis}"
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not enough data to generate forecast.</p>
            )}
          </CardContent>
        </Card>
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
              <Link href="/leads" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">
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
                <tr key={lead.id} className="hover:bg-slate-50/50 dark:bg-slate-900/30 transition-colors">
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
                    <Link href={`/leads/${lead.id}`} className="text-muted-foreground hover:text-indigo-600 transition-colors">
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
