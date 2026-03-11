'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    ArrowLeft, Mail, Shield, MapPin,
    Calendar, TrendingUp, Users, Target,
    CheckCircle, Clock, ExternalLink, Loader2
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function TeamMemberDetailPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const res = await fetch(`/api/team/${id}`);
                const json = await res.json();
                setData(json);
                setLoading(false);
            } catch (err) { console.error(err); }
        };
        if (id) fetchMember();
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
    );
    if (!data) return <div className="p-12 text-center text-muted-foreground">Component Not Found.</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/10">
            {/* Header */}
            <header className="bg-white dark:bg-slate-950 border-b border-border px-8 py-6 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/team" className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all border border-slate-100 dark:border-slate-800">
                            <ArrowLeft size={18} className="text-slate-500" />
                        </Link>
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20">
                                {data.name.charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-black tracking-tight uppercase">{data.name}</h1>
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                                        data.status === 'Active' ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : "bg-slate-100 text-slate-400"
                                    )}>{data.status}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-1.5 font-bold text-slate-400 text-xs tracking-wide">
                                    <span className="flex items-center gap-1.5"><Shield size={12} className="text-indigo-600" /> {data.role}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5"><Mail size={12} /> {data.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">

                    {/* Performance Stats */}
                    <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <PerformanceCard icon={Target} label="Assigned Leads" value={data.stats.totalLeads} sub="Total Volume" />
                        <PerformanceCard icon={CheckCircle} label="Leads Won" value={data.stats.wonLeads} sub={`${((data.stats.wonLeads / (data.stats.totalLeads || 1)) * 100).toFixed(0)}% Conv. Rate`} isGreen />
                        <PerformanceCard icon={TrendingUp} label="Pipeline Value" value={`$${(data.stats.activeValue / 1000).toFixed(1)}k`} sub="Current Active" isIndigo />
                        <PerformanceCard icon={Clock} label="Member Since" value={new Date(data.created_at).toLocaleDateString()} sub="Seniority: Level 1" />
                    </div>

                    {/* Leads Management */}
                    <div className="col-span-12 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Users size={14} className="text-indigo-600" /> Inventory Portfolio
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.leads.map((lead) => (
                                <Link href={`/leads/${lead.id}`} key={lead.id}>
                                    <div className="card p-5 bg-white dark:bg-slate-950 border-0 ring-1 ring-border/50 hover:ring-indigo-500/30 transition-all group relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">{lead.company}</div>
                                                <h4 className="text-sm font-black uppercase truncate pr-4">{lead.name}</h4>
                                            </div>
                                            <div className={clsx(
                                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                                                lead.status === 'Won' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-500"
                                            )}>{lead.status}</div>
                                        </div>

                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-slate-900">
                                            <div className="text-indigo-600 font-black text-xs">${lead.value?.toLocaleString()}</div>
                                            <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                Propel <ExternalLink size={10} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {data.leads.length === 0 && (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                                    <h4 className="text-sm font-black uppercase text-slate-400 tracking-widest">Zero assigned inventory</h4>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Use auto-assignment to populate this roster</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PerformanceCard({ icon: Icon, label, value, sub, isGreen, isIndigo }) {
    return (
        <div className="card p-6 bg-white dark:bg-slate-950 border-0 ring-1 ring-border/50 shadow-sm relative overflow-hidden group">
            <div className="flex flex-col">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-3">
                    <Icon size={12} className={clsx(isGreen ? "text-emerald-500" : isIndigo ? "text-indigo-600" : "text-slate-400")} />
                    {label}
                </div>
                <div className="text-3xl font-black tracking-tighter">{value}</div>
                <div className={clsx(
                    "text-[10px] font-bold mt-2",
                    isGreen ? "text-emerald-600" : isIndigo ? "text-indigo-600" : "text-slate-400"
                )}>
                    {sub}
                </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <Icon size={120} />
            </div>
        </div>
    );
}
