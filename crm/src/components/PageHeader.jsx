'use client';

import { useState, useEffect } from 'react';
import { Search, Command, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import SmartNotifications from './SmartNotifications';
import { motion } from 'framer-motion';

export default function PageHeader({ 
    title, 
    subtitle, 
    children, 
    searchPlaceholder = "Search...", 
    searchValue, 
    onSearchChange 
}) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) setUser(data.user);
            })
            .catch(() => { });
    }, []);

    const userInitials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'US';

    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-border/40">
            <div className="h-20 px-4 md:px-8 flex items-center justify-between gap-6">
                {/* Left: Title & Subtitle */}
                <div className="flex flex-col min-w-0">
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Center: Search (if enabled) */}
                {onSearchChange !== undefined && (
                    <div className="flex-1 max-w-md hidden md:block">
                        <div className="relative group">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="h-10 pl-10 pr-12 text-xs font-bold bg-slate-100/50 dark:bg-slate-900/50 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/20 rounded-xl transition-all"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400">
                                <Command size={8} /> K
                            </div>
                        </div>
                    </div>
                )}

                {/* Right: Actions, Notifications, Profile */}
                <div className="flex items-center gap-3">
                    {/* Page specific actions passed via children */}
                    <div className="flex items-center gap-2">
                        {children}
                    </div>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

                    <div className="flex items-center gap-1">
                        <SmartNotifications />
                        
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-black shadow-lg shadow-indigo-200/50 dark:shadow-none cursor-pointer border-2 border-white dark:border-slate-900"
                            title={user?.email || 'User Profile'}
                        >
                            {userInitials}
                        </motion.div>
                    </div>
                </div>
            </div>
        </header>
    );
}
