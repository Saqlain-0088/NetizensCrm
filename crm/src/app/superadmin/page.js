'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Building2, CreditCard, Users, Ticket, Megaphone,
    Sparkles, Settings, ChevronRight, TrendingUp, Activity, Shield,
    LogOut, Menu, X, Zap, Globe, Bell, BarChart3
} from 'lucide-react';
import SuperDashboard from './components/SuperDashboard';
import SuperCompanies from './components/SuperCompanies';
import SuperPlans from './components/SuperPlans';
import SuperUsers from './components/SuperUsers';
import SuperBilling from './components/SuperBilling';
import SuperTickets from './components/SuperTickets';
import SuperAnnouncements from './components/SuperAnnouncements';
import SuperAIControls from './components/SuperAIControls';
import SuperLogs from './components/SuperLogs';

const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'plans', label: 'Plans & Features', icon: Zap },
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'tickets', label: 'Support', icon: Ticket },
    { id: 'ai', label: 'AI Controls', icon: Sparkles },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'logs', label: 'Activity Logs', icon: Activity },
];

export default function SuperAdminPage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [authorized, setAuthorized] = useState(null);

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(d => {
            const email = d?.user?.email;
            const superEmail = 'superadmin@netizenscrm.com';
            setAuthorized(email === superEmail || d?.user?.role === 'superadmin');
        }).catch(() => setAuthorized(false));
    }, []);

    if (authorized === null) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (authorized === false) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
            <div className="text-center">
                <Shield size={48} className="mx-auto mb-4 text-red-500" />
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-slate-400">You don't have permission to access the Super Admin panel.</p>
            </div>
        </div>
    );

    const PANELS = {
        dashboard: <SuperDashboard />,
        companies: <SuperCompanies />,
        plans: <SuperPlans />,
        users: <SuperUsers />,
        billing: <SuperBilling />,
        tickets: <SuperTickets />,
        announcements: <SuperAnnouncements />,
        ai: <SuperAIControls />,
        logs: <SuperLogs />,
    };

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Shield size={16} className="text-white" />
                        </div>
                        <div>
                            <div className="text-[13px] font-black tracking-tight">Super Admin</div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">NetizensCRM</div>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    <div className="px-3 pt-2 pb-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Main Menu</span>
                    </div>
                    {NAV.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative
                                    ${isActive
                                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                                    }`}
                            >
                                <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
                                {item.label}
                                {isActive && <ChevronRight size={12} className="ml-auto text-indigo-400" />}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-slate-800 shrink-0">
                    <a href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all text-sm font-medium">
                        <Globe size={15} />
                        Back to CRM
                    </a>
                    <button
                        onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login'; }}
                        className="w-full mt-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all text-sm font-medium"
                    >
                        <LogOut size={15} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 shrink-0 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-5 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-base font-black text-slate-100">
                                {NAV.find(n => n.id === activeTab)?.label}
                            </h1>
                            <p className="text-[10px] text-slate-500 font-medium">NetizensCRM Super Admin Console</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            Super Admin
                        </div>
                    </div>
                </header>

                {/* Panel Content */}
                <main className="flex-1 overflow-y-auto bg-slate-950 p-5 lg:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                        >
                            {PANELS[activeTab]}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
