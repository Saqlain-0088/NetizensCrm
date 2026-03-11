'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Settings,
    PlusCircle,
    Search,
    Bell,
    Shield,
    ChevronDown,
    LogOut,
    TrendingUp,
    BookUser
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import SmartNotifications from './SmartNotifications';
import { useEffect, useState } from 'react';




export default function SidebarContent() {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
            })
            .catch(() => { });
    }, []);


    const navItems = [
        { href: '/dashboard', label: t('common.dashboard'), icon: LayoutDashboard },
        { href: '/leads', label: t('common.pipeline'), icon: TrendingUp },
        { href: '/contacts', label: 'Contacts', icon: BookUser },
        { href: '/team', label: t('common.team'), icon: Shield },
        { href: '/leads/new', label: t('common.newLead'), icon: PlusCircle },
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950">
            {/* Header / Brand (Only visible if not in mobile sheet where brand is in header) */}
            <div className="hidden lg:flex h-14 px-6 items-center justify-between border-b border-border/50">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        N
                    </div>
                    <span className="font-bold text-[15px] tracking-tight">NetizensCRM</span>
                </div>
                <div className="flex items-center gap-2">
                    <SmartNotifications />
                    <LanguageSwitcher />
                </div>
            </div>

            {/* Quick Search */}
            <div className="p-4">
                <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder={t('common.searchPlaceholder')}
                        className="w-full bg-slate-100 dark:bg-slate-900 border-0 rounded-md py-1.5 pl-9 pr-3 text-xs focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-3 space-y-0.5">
                <div className="px-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{t('common.mainMenu')}</span>
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group relative",
                                isActive
                                    ? "bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400"
                                    : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-foreground"
                            )}
                        >
                            <Icon size={18} className={clsx("transition-transform group-hover:scale-105", isActive && "text-indigo-600 dark:text-indigo-400")} />
                            <span>{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 w-0.5 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                                />
                            )}
                        </Link>
                    );
                })}

                <div className="pt-6 pb-2 px-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Account</span>
                </div>
                <Link
                    href="/settings"
                    className={clsx(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all group",
                        pathname === '/settings' ? "bg-slate-100 dark:bg-slate-900 text-indigo-600" : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-foreground"
                    )}
                >
                    <Settings size={18} />
                    <span>{t('common.settings')}</span>
                </Link>
            </nav>

            {/* User Profile Section */}
            <div className="mt-auto p-4 border-t border-border/50">
                {user?.email === (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'superadmin@netizenscrm.com') && (
                    <Link href="/superadmin" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-bold text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all mb-2 border border-indigo-200/30 dark:border-indigo-800/30">
                        <Shield size={16} className="text-indigo-500" />
                        <span>Super Admin Panel</span>
                    </Link>
                )}
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                            {user?.name?.slice(0, 2).toUpperCase() || 'JS'}
                        </div>
                        <div className="flex flex-col truncate">
                            <span className="text-xs font-bold truncate">{user?.name || 'John Smith'}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{user?.email || 'john@netizenscrm.com'}</span>
                        </div>

                    </div>
                    <button
                        onClick={async () => {
                            await fetch('/api/auth/logout', { method: 'POST' });
                            window.location.href = '/login';
                        }}
                        className="flex items-center gap-2 px-2 py-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold text-[10px] uppercase tracking-wider"
                    >
                        <LogOut size={14} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
