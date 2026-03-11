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
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authenticating...</span>
            </div>
        </div>
    );

    if (authorized === false) return (
        <div className="min-h-screen flex items-center justify-center bg-white text-slate-900 px-6">
            <div className="text-center max-w-sm">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
                    <Shield size={40} className="text-red-500" />
                </div>
                <h1 className="text-2xl font-black mb-3 tracking-tight">Access Restricted</h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">This terminal is restricted to netizen administrative personnel only. Unauthorized access attempts are monitored.</p>
                <a href="/login" className="inline-flex items-center justify-center px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95">Return to Portal</a>
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
        <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                            <Shield size={16} className="text-white" />
                        </div>
                        <div>
                            <div className="text-[13px] font-black tracking-tight text-slate-900">Super Admin</div>
                            <div className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest">NetizensCRM</div>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-900">
                        <X size={18} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    <div className="px-3 pt-2 pb-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Main Menu</span>
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
                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon size={16} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                {item.label}
                                {isActive && <ChevronRight size={12} className="ml-auto text-indigo-400" />}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="p-3 border-t border-slate-100 shrink-0">
                    <a href="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-sm font-medium">
                        <Globe size={15} />
                        Back to CRM
                    </a>
                    <button
                        onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login'; }}
                        className="w-full mt-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all text-sm font-medium"
                    >
                        <LogOut size={15} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-5 lg:px-8 shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-900">
                            <Menu size={20} />
                        </button>
                        <div>
                            <h1 className="text-base font-black text-slate-900">
                                {NAV.find(n => n.id === activeTab)?.label}
                            </h1>
                            <p className="text-[10px] text-slate-500 font-medium tracking-wide">NetizensCRM Super Admin Console</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-700 flex items-center gap-1.5 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Super Admin
                        </div>
                    </div>
                </header>

                {/* Panel Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-5 lg:p-8">
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
