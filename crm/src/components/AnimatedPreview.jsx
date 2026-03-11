'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Target, Briefcase, TrendingUp, Building, Mail, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CursorOverlay } from '@/components/AnimatedCursor';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

const SAMPLE_METRICS = [
    { label: 'Pipeline Value', value: '$2.4M', change: '+15.2%', icon: DollarSign, tooltip: 'View pipeline value' },
    { label: 'Closed Revenue', value: '$892k', change: '+8.4%', icon: Target, tooltip: 'See closed deals' },
    { label: 'Open Deals', value: 27, change: '+4', icon: Briefcase, tooltip: 'Active opportunities' },
    { label: 'Avg Deal Size', value: '$89k', change: '+2.3%', icon: TrendingUp, tooltip: 'Average deal value' },
];

const SAMPLE_CHART_DATA = [
    { name: 'Mon', revenue: 12400 },
    { name: 'Tue', revenue: 16800 },
    { name: 'Wed', revenue: 14200 },
    { name: 'Thu', revenue: 22100 },
    { name: 'Fri', revenue: 19500 },
];

const SAMPLE_STAGES = [
    { label: 'New Leads', value: 45, color: 'bg-indigo-500', count: 12 },
    { label: 'Contacted', value: 65, color: 'bg-blue-500', count: 8 },
    { label: 'Qualified', value: 30, color: 'bg-emerald-500', count: 5 },
];

const SAMPLE_LEADS = [
    { company: 'Acme Corp', name: 'John Smith', status: 'Qualified', value: 45000 },
    { company: 'TechStart Inc', name: 'Sarah Lee', status: 'Contacted', value: 28000 },
    { company: 'Global Solutions', name: 'Mike Chen', status: 'New', value: 125000 },
];

const SAMPLE_PIPELINE = {
    New: [{ company: 'Innovate Labs', value: 32000 }, { company: 'DataFlow', value: 18000 }],
    Contacted: [{ company: 'Acme Corp', value: 45000 }],
    Qualified: [{ company: 'TechStart Inc', value: 28000 }, { company: 'CloudNine', value: 95000 }],
    Won: [{ company: 'Global Solutions', value: 125000 }],
};

const SAMPLE_CONTACT = {
    name: 'Sarah Chen',
    company: 'TechStart Inc',
    role: 'VP of Sales',
    email: 'sarah@techstart.io',
    phone: '+1 (555) 234-5678',
    status: 'Active',
};

function Clickable({ children, onClick, className = '' }) {
    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
            className={`cursor-pointer select-none ${className}`}
        >
            {children}
        </div>
    );
}

export default function AnimatedPreview({ label }) {
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
    const [cursorVisible, setCursorVisible] = useState(false);
    const [tooltip, setTooltip] = useState(null);
    const [isClicking, setIsClicking] = useState(false);
    const [pulsedId, setPulsedId] = useState(null);
    const containerRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setCursorVisible(true);
    }, []);

    const handleMouseLeave = useCallback(() => setCursorVisible(false), []);

    const handleClick = useCallback((message, id = null) => {
        setIsClicking(true);
        setTooltip(message);
        setPulsedId(id);
        setTimeout(() => setIsClicking(false), 150);
        setTimeout(() => setTooltip(null), 2000);
        setTimeout(() => setPulsedId(null), 400);
    }, []);

    const renderPreview = () => {
        switch (label) {
            case 'Dashboard':
                return (
                    <motion.div variants={container} initial="hidden" animate="show" className="p-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            {SAMPLE_METRICS.map((m, i) => {
                                const Icon = m.icon;
                                return (
                                    <motion.div key={i} variants={item}>
                                        <Clickable onClick={() => handleClick(m.tooltip, `metric-${i}`)}>
                                            <motion.div
                                                animate={pulsedId === `metric-${i}` ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Card className="border-border/50 overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all">
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center">
                                                                <Icon size={12} className="text-indigo-600" />
                                                            </div>
                                                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-600">
                                                                {m.change}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">{m.label}</p>
                                                        <p className="text-sm font-black">{m.value}</p>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        </Clickable>
                                    </motion.div>
                                );
                            })}
                        </div>
                        <div className="flex gap-2">
                            <motion.div variants={item} className="flex-1 rounded-lg bg-slate-50 border border-border/50 p-2 min-w-0">
                                <p className="text-[9px] font-bold text-muted-foreground mb-2">Weekly Revenue</p>
                                <div className="flex gap-2 h-20">
                                    {SAMPLE_CHART_DATA.map((d, i) => {
                                        const barHeight = Math.max(40, (d.revenue / 25000) * 100);
                                        return (
                                            <div key={i} className="flex-1 min-w-[8px] flex flex-col items-center gap-1">
                                                <div className="flex-1 w-full flex flex-col justify-end min-h-[48px]">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${barHeight}%` }}
                                                        transition={{ delay: 0.4 + i * 0.08, duration: 0.6, type: 'spring', stiffness: 100 }}
                                                        className="w-full min-h-[6px] rounded-t bg-indigo-600"
                                                    />
                                                </div>
                                                <span className="text-[8px] font-medium text-slate-600">{d.name}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                            <div className="w-24 space-y-2">
                                {SAMPLE_STAGES.map((s, i) => (
                                    <motion.div key={i} variants={item} className="space-y-0.5">
                                        <div className="flex justify-between text-[8px] font-bold">
                                            <span>{s.label}</span>
                                            <span className="text-muted-foreground">{s.count}</span>
                                        </div>
                                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${s.value}%` }}
                                                transition={{ delay: 0.5 + i * 0.1, duration: 0.6, type: 'spring', stiffness: 80 }}
                                                className={`h-full ${s.color} rounded-full`}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );
            case 'Lead tracking':
                return (
                    <motion.div variants={container} initial="hidden" animate="show" className="p-3">
                        <div className="rounded-lg border border-border/50 overflow-hidden">
                            <table className="w-full text-[11px]">
                                <thead>
                                    <tr className="bg-slate-50/80 text-muted-foreground font-semibold">
                                        <th className="px-3 py-2 text-left">Company / Contact</th>
                                        <th className="px-3 py-2 text-left">Stage</th>
                                        <th className="px-3 py-2 text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {SAMPLE_LEADS.map((lead, i) => (
                                        <motion.tr
                                            key={i}
                                            variants={item}
                                            className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                                            onClick={() => handleClick(`Open ${lead.company} details`)}
                                            whileHover={{ x: 4 }}
                                        >
                                            <td className="px-3 py-2">
                                                <div className="font-bold text-slate-900">{lead.company}</div>
                                                <div className="text-[10px] text-muted-foreground">{lead.name}</div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <Badge variant="outline" className="text-[9px] font-bold border-slate-200">
                                                    {lead.status}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-2 text-right font-black">${lead.value?.toLocaleString('en-US')}</td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                );
            case 'Pipeline board':
                return (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 flex gap-2 overflow-x-auto min-h-[200px]"
                    >
                        {['New', 'Contacted', 'Qualified', 'Won'].map((col, colIdx) => (
                            <motion.div
                                key={col}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: colIdx * 0.08, type: 'spring', stiffness: 120 }}
                                className="w-36 shrink-0 rounded-lg bg-slate-100/80 dark:bg-slate-900/40 border border-border/50 flex flex-col"
                            >
                                <div className="p-2 flex items-center justify-between border-b border-border/30">
                                    <span className="font-bold text-[11px] text-slate-900">{col}</span>
                                    <Badge variant="secondary" className="text-[9px] h-4 px-1">
                                        {(SAMPLE_PIPELINE[col] || []).length}
                                    </Badge>
                                </div>
                                <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                                    {(SAMPLE_PIPELINE[col] || []).map((card, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + colIdx * 0.1 + i * 0.08, type: 'spring', stiffness: 150 }}
                                            whileHover={{ scale: 1.02, x: 2 }}
                                            onClick={() => handleClick(`Drag ${card.company} to move stage`)}
                                            className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-border/50 cursor-pointer"
                                        >
                                            <div className="font-bold text-[11px] text-slate-900 line-clamp-1">{card.company}</div>
                                            <div className="text-[10px] font-black text-indigo-600 mt-1">
                                                ${card.value?.toLocaleString('en-US')}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                );
            case 'Contact profile':
                return (
                    <motion.div variants={container} initial="hidden" animate="show" className="p-4">
                        <div className="flex gap-4">
                            <motion.div
                                variants={item}
                                onClick={() => handleClick('View contact profile')}
                                className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg cursor-pointer hover:scale-105 transition-transform"
                            >
                                {SAMPLE_CONTACT.name.split(' ').map(n => n[0]).join('')}
                            </motion.div>
                            <div className="flex-1 min-w-0 space-y-2">
                                <motion.div variants={item} onClick={() => handleClick('Edit contact')} className="cursor-pointer hover:text-indigo-600">
                                    <h3 className="font-bold text-slate-900 text-sm">{SAMPLE_CONTACT.name}</h3>
                                    <p className="text-[11px] text-muted-foreground">{SAMPLE_CONTACT.role}</p>
                                </motion.div>
                                <motion.div variants={item} onClick={() => handleClick('Email contact')} className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer hover:text-indigo-600">
                                    <Mail size={12} />
                                    <span className="truncate">{SAMPLE_CONTACT.email}</span>
                                </motion.div>
                                <motion.div variants={item} onClick={() => handleClick('Call contact')} className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer hover:text-indigo-600">
                                    <Phone size={12} />
                                    <span>{SAMPLE_CONTACT.phone}</span>
                                </motion.div>
                                <motion.div variants={item} onClick={() => handleClick('Contact is active')}>
                                    <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 text-[10px] cursor-pointer">
                                        {SAMPLE_CONTACT.status}
                                    </Badge>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4 }}
            onMouseMove={label !== 'Contact profile' ? handleMouseMove : undefined}
            onMouseLeave={label !== 'Contact profile' ? handleMouseLeave : undefined}
            className={`relative overflow-hidden bg-white dark:bg-slate-950 min-h-[200px] border-t border-border/50 ${label !== 'Contact profile' ? 'cursor-none' : ''}`}
        >
            {renderPreview()}
            {label !== 'Contact profile' && (
                <CursorOverlay pos={cursorPos} visible={cursorVisible} isClicking={isClicking} />
            )}
            <AnimatePresence mode="wait">
                {tooltip && (
                    <motion.div
                        key={tooltip}
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute z-[60] left-1/2 -translate-x-1/2 bottom-4 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-xl whitespace-nowrap"
                    >
                        {tooltip}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
