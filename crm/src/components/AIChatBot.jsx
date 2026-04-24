'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', content: "Hi! I'm your AI Sales Assistant. Ask me anything about your pipeline, leads, or follow-ups." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiFlags, setAiFlags] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                setAiFlags(data?.company?.ai_flags || {});
                setUserRole(data?.user?.role);
            })
            .catch(() => { });
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    if (userRole !== 'superadmin' && aiFlags && aiFlags.chat_assistant === false) return null;

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = { id: Date.now(), role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.content })
            });
            const data = await res.json();

            if (data.reply) {
                setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: "Sorry, I ran into an error processing your request." }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: "Connection error. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={clsx(
                            "bg-white dark:bg-slate-950 border border-indigo-100 dark:border-indigo-900/50 shadow-2xl overflow-hidden flex flex-col mb-4 origin-bottom-right transition-all duration-300",
                            isExpanded ? "w-[80vw] md:w-[60vw] h-[80vh] rounded-3xl" : "w-[360px] h-[550px] max-h-[70vh] rounded-2xl"
                        )}
                    >
                        {/* Header */}
                        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm text-white">
                                    <Sparkles size={16} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm tracking-wide">AI Assistant</h3>
                                    <p className="text-[10px] text-indigo-100 uppercase tracking-widest font-medium">Sales Intelligence</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-1.5 text-white/80 hover:bg-white/20 hover:text-white rounded-lg transition-colors hidden md:block"
                                >
                                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-white/80 hover:bg-white/20 hover:text-white rounded-lg transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20">
                            <div className="text-center pb-4">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-widest">Today</span>
                            </div>

                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={clsx(
                                        "flex gap-3 max-w-[85%]",
                                        msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <div className={clsx(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                                        msg.role === 'user'
                                            ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                                            : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600"
                                    )}>
                                        {msg.role === 'user' ? <span className="text-xs font-bold">ME</span> : <Sparkles size={14} />}
                                    </div>
                                    <div className={clsx(
                                        "p-3.5 rounded-2xl text-sm leading-relaxed",
                                        msg.role === 'user'
                                            ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-sm shadow-md"
                                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-sm shadow-sm"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                        <Sparkles size={14} className="animate-pulse" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-sm flex gap-1 items-center">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 shrink-0">
                            <form onSubmit={handleSend} className="flex gap-2 relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-slate-100 dark:bg-slate-900 border-0 rounded-full pl-5 pr-12 py-3.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-full flex items-center justify-center transition-all"
                                >
                                    <Send size={16} className="-ml-1" />
                                </button>
                            </form>
                            <div className="flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-1">
                                {['Summarize pipeline', 'Who needs follow-up?'].map(txt => (
                                    <button
                                        key={txt}
                                        type="button"
                                        onClick={() => setInput(txt)}
                                        className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                    >
                                        {txt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 rounded-full flex items-center justify-center shadow-xl shadow-slate-900/20 dark:shadow-white/10 transition-all z-50 border-4 border-white dark:border-slate-950"
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                {!isOpen && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border border-white dark:border-slate-950 rounded-full"></span>}
            </button>
        </div>
    );
}
