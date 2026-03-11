'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Zap, X, TrendingUp, Users, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UpgradeBanner() {
    const [usage, setUsage] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data?.user?.plan === 'free' && data?.usage) {
                    setUsage(data.usage);
                }
            })
            .catch(() => { });
    }, []);

    if (!usage || dismissed) return null;

    const leadsPct = usage.leads.limit ? Math.round((usage.leads.used / usage.leads.limit) * 100) : 0;
    const contactsPct = usage.contacts.limit ? Math.round((usage.contacts.used / usage.contacts.limit) * 100) : 0;
    const nearLimit = leadsPct >= 80 || contactsPct >= 80;
    const atLimit = leadsPct >= 100 || contactsPct >= 100;

    const barColor = atLimit
        ? 'bg-red-500'
        : nearLimit
            ? 'bg-amber-400'
            : 'bg-indigo-500';

    const bgColor = atLimit
        ? 'bg-red-50 border-red-200/60'
        : nearLimit
            ? 'bg-amber-50 border-amber-200/60'
            : 'bg-indigo-50 border-indigo-200/60';

    const textColor = atLimit
        ? 'text-red-700'
        : nearLimit
            ? 'text-amber-700'
            : 'text-indigo-700';

    const iconColor = atLimit ? 'text-red-500' : nearLimit ? 'text-amber-500' : 'text-indigo-500';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`${bgColor} border-b px-5 py-3 flex items-center justify-between gap-4 z-30 shadow-sm`}
            >
                {/* Left: Plan badge + message */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Free Plan Pill */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-current/10 shadow-sm shrink-0 ${textColor}`}>
                        <Zap size={11} className={iconColor} fill="currentColor" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Free Plan</span>
                    </div>

                    <span className={`text-xs font-semibold ${textColor} hidden sm:block shrink-0`}>
                        {atLimit ? '🚫 You\'ve hit your plan limits' : nearLimit ? '⚠️ Approaching plan limits' : 'You\'re on the free plan'}
                    </span>

                    {/* Usage Meters */}
                    <div className="flex items-center gap-4 flex-wrap">
                        {usage.leads.limit && (
                            <UsageBar
                                icon={TrendingUp}
                                label="Leads"
                                used={usage.leads.used}
                                limit={usage.leads.limit}
                                pct={leadsPct}
                                barColor={leadsPct >= 100 ? 'bg-red-500' : leadsPct >= 80 ? 'bg-amber-400' : 'bg-indigo-500'}
                            />
                        )}
                        {usage.contacts.limit && (
                            <UsageBar
                                icon={Users}
                                label="Contacts"
                                used={usage.contacts.used}
                                limit={usage.contacts.limit}
                                pct={contactsPct}
                                barColor={contactsPct >= 100 ? 'bg-red-500' : contactsPct >= 80 ? 'bg-amber-400' : 'bg-indigo-500'}
                            />
                        )}
                    </div>
                </div>

                {/* Right: Upgrade CTA + Dismiss */}
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/settings?tab=billing"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-sm shadow-indigo-500/30"
                    >
                        <Sparkles size={10} />
                        Upgrade
                        <ArrowUpRight size={10} />
                    </Link>
                    <button
                        onClick={() => setDismissed(true)}
                        className={`p-1.5 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors ${textColor}`}
                        aria-label="Dismiss"
                    >
                        <X size={14} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

function UsageBar({ icon: Icon, label, used, limit, pct, barColor }) {
    return (
        <div className="flex items-center gap-2 min-w-[130px]">
            <Icon size={11} className="text-muted-foreground shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
                    <span className="text-[9px] font-bold text-muted-foreground">{used}<span className="opacity-50">/{limit}</span></span>
                </div>
                <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-slate-800/70 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(pct, 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${barColor}`}
                    />
                </div>
            </div>
        </div>
    );
}
