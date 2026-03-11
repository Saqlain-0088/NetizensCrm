'use client';
import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, TrendingUp, Clock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Link from 'next/link';

export default function SmartNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Fetch AI generated notifications
        fetch('/api/ai/notifications')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setNotifications(data);
                    setUnreadCount(data.filter(n => !n.read).length);
                }
            })
            .catch(console.error);
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-muted-foreground focus:outline-none"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white dark:border-slate-950"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-950 rounded-xl shadow-xl border border-border/50 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                                AI Smart Alerts
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    <Bell size={24} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-xs font-medium">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/30">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={clsx(
                                                "p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group",
                                                !notif.read ? "bg-indigo-50/30 dark:bg-indigo-900/10" : "opacity-70"
                                            )}
                                            onClick={() => markAsRead(notif.id)}
                                        >
                                            <div className={clsx(
                                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                                notif.type === 'risk' ? "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-900/50" :
                                                    notif.type === 'opportunity' ? "bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-900/50" :
                                                        "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-200 dark:border-amber-900/50"
                                            )}>
                                                {notif.type === 'risk' ? <AlertTriangle size={14} /> :
                                                    notif.type === 'opportunity' ? <TrendingUp size={14} /> :
                                                        <Clock size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">
                                                        {notif.time}
                                                    </span>
                                                    {notif.link && (
                                                        <Link
                                                            href={notif.link}
                                                            className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                                                        >
                                                            Take Action &rarr;
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                            {!notif.read && (
                                                <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 self-center"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
