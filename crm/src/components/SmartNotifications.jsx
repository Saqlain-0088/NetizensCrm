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
                className="relative p-2.5 rounded-xl hover:bg-slate-100 transition-all text-slate-500 hover:text-indigo-600 focus:outline-none border border-transparent hover:border-slate-200"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-96 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                    <Sparkles size={14} className="text-indigo-600" />
                                    AI Smart Alerts
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Automated priority tracking</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                        <Bell size={24} className="text-slate-300" />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">All caught up!</p>
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">No new alerts from the AI</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={clsx(
                                                "p-5 flex gap-4 hover:bg-slate-50 transition-all group cursor-pointer relative",
                                                !notif.read ? "bg-indigo-50/20" : "opacity-60"
                                            )}
                                            onClick={() => markAsRead(notif.id)}
                                        >
                                            {!notif.read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
                                            )}
                                            <div className={clsx(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm",
                                                notif.type === 'risk' ? "bg-red-50 text-red-600 border-red-100" :
                                                    notif.type === 'opportunity' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                        "bg-amber-50 text-amber-600 border-amber-100"
                                            )}>
                                                {notif.type === 'risk' ? <AlertTriangle size={18} /> :
                                                    notif.type === 'opportunity' ? <TrendingUp size={18} /> :
                                                        <Clock size={18} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 leading-snug">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                                        {notif.time}
                                                    </span>
                                                    {notif.link && (
                                                        <Link
                                                            href={notif.link}
                                                            className="flex items-center gap-1 text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest group-hover:translate-x-1 transition-transform"
                                                        >
                                                            Take Action <Check size={12} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center">
                                <Link href="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                                    View all history
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Click outside overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/5 backdrop-blur-[1px]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}
