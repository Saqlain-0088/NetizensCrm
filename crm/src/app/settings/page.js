'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, CreditCard, Shield, Globe, Bell, CheckCircle2, TrendingUp, Users, Clock, Settings } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Suspense } from 'react';

function SettingsContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                setUserData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const TABS = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'billing', label: 'Plan & Billing', icon: CreditCard },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight uppercase text-slate-900">{t('common.settings')}</h1>
                <p className="text-slate-500 font-medium tracking-wide">
                    Manage your account preferences, billing, and system configuration.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200 shadow-sm">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                            activeTab === tab.id
                                ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                        )}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8">
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <Card className="border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-lg font-black tracking-tight">Language Preferences</CardTitle>
                                <CardDescription className="text-xs font-medium text-slate-400">Select your preferred language for the CRM interface.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <p className="text-sm text-slate-600 mb-6 font-medium">
                                    You can change your language from the top right menu or sidebar. The interface will reload to apply the language change.
                                </p>
                                <div className="flex gap-4">
                                    <button className="px-6 py-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-black text-[11px] uppercase tracking-widest hover:bg-indigo-100 transition-all">English (US)</button>
                                    <button className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-400 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all">More Languages...</button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'billing' && (
                    <div className="space-y-8">
                        {/* Current Plan Card */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <Card className="border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                            <Zap size={120} />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Zap size={14} fill="currentColor" />
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Current Subscription</span>
                                            </div>
                                            <h2 className="text-4xl font-black tracking-tight uppercase mb-4">{userData?.user?.plan || 'Free'} Plan</h2>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest">
                                                    <Clock size={12} />
                                                    Expires: {userData?.company?.trial_ends_at ? new Date(userData.company.trial_ends_at).toLocaleDateString() : 'Never'}
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                                                    <CheckCircle2 size={12} />
                                                    Status: Active
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <UsageMetric
                                                icon={TrendingUp}
                                                label="Lead Volume"
                                                used={userData?.usage?.leads?.used || 0}
                                                limit={userData?.usage?.leads?.limit || 100}
                                                color="indigo"
                                            />
                                            <UsageMetric
                                                icon={Users}
                                                label="Contacts Storage"
                                                used={userData?.usage?.contacts?.used || 0}
                                                limit={userData?.usage?.contacts?.limit || 250}
                                                color="emerald"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                        <CardTitle className="text-lg font-black tracking-tight">Included Features</CardTitle>
                                        <CardDescription className="text-xs font-medium text-slate-400">Everything unlocked by your current subscription</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {['AI Lead Scoring', 'Smart Notifications', 'Basic Team Management', 'Email Integration', 'Visual Sales Pipeline', 'Basic Analytics'].map(f => (
                                                <div key={f} className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-700">{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <Card className="border-indigo-100 bg-indigo-50/30 rounded-[2rem] p-8 border-2 border-dashed flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-xl shadow-indigo-200/50 flex items-center justify-center mb-6 border border-indigo-100">
                                        <Sparkles size={32} className="text-indigo-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-3">Upgrade Your Growth</h3>
                                    <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
                                        Unlock advanced AI features, unlimited users, and priority support to scale your sales team faster.
                                    </p>
                                    <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95">View Pricing Plans</button>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={
            <div className="p-8 max-w-6xl mx-auto flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-sans">Loading Vault...</span>
            </div>
        }>
            <SettingsContent />
        </Suspense>
    );
}

function UsageMetric({ icon: Icon, label, used, limit, color }) {
    const pct = Math.round((used / limit) * 100);
    const colorClass = color === 'indigo' ? 'bg-indigo-600' : 'bg-emerald-500';

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Icon size={16} className={`text-${color}-500`} />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{used} / {limit}</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    className={`h-full rounded-full ${colorClass}`}
                />
            </div>
            <p className="text-[10px] font-bold text-slate-400 text-right uppercase tracking-wider">{pct}% of limit reached</p>
        </div>
    );
}


