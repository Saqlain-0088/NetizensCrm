'use client';
import { useState, useRef, useEffect } from 'react';
import { Mail, Sparkles, X, Send, Copy, Check, Loader2, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIEmailModal({ isOpen, onClose, lead }) {
    const [prompt, setPrompt] = useState('');
    const [draft, setDraft] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
        }
    }, [draft]);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (isGenerating) return;
        setIsGenerating(true);
        setDraft('');

        try {
            const res = await fetch('/api/ai/generate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: lead.id, prompt })
            });

            if (!res.ok) throw new Error('Failed to generate draft');
            const data = await res.json();

            if (data.draft) {
                // Simulate typing effect for the generated draft
                let currentDraft = '';
                const tokens = data.draft.split(' ');

                for (let i = 0; i < tokens.length; i++) {
                    currentDraft += tokens[i] + ' ';
                    setDraft(currentDraft);
                    await new Promise(r => setTimeout(r, 15)); // 15ms per word typing speed
                }
            } else {
                throw new Error(data.error || 'No draft generated');
            }
        } catch (error) {
            console.error('Email gen error:', error);
            setDraft('An error occurred while generating the email draft. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(draft);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSend = async () => {
        if (!draft) return;

        // Log action
        try {
            await fetch(`/api/leads/${lead.id}/actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'Email (AI Draft)', content: draft })
            });
        } catch (e) {
            console.error(e);
        }

        // Open user's email client
        const subjectMatch = draft.match(/Subject:\s*(.*)/i);
        const subject = subjectMatch ? encodeURIComponent(subjectMatch[1]) : '';
        const body = encodeURIComponent(draft.replace(/Subject:\s*.*\n\n?/i, ''));
        window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-2xl border border-border/50 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center">
                            <Sparkles size={16} className="animate-pulse" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">AI Email Generator</h2>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Drafting to: {lead.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                    {/* Input Config Area */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Context / Goal (Optional)</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="E.g. Follow up on yesterday's meeting..."
                                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400"
                                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className={clsx(
                                    "px-6 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all",
                                    isGenerating
                                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                                )}
                            >
                                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                {isGenerating ? 'Drafting...' : 'Generate'}
                            </button>
                        </div>
                        <div className="flex gap-2">
                            {['Introduction', 'Follow up', 'Discount offer'].map(suggestion => (
                                <button
                                    key={suggestion}
                                    onClick={() => setPrompt(suggestion)}
                                    className="px-3 py-1.5 rounded-lg border border-border/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Output Area */}
                    <div className="flex-1 flex flex-col relative min-h-[250px]">
                        {draft ? (
                            <div className="relative group flex-1">
                                <textarea
                                    ref={textareaRef}
                                    value={draft}
                                    onChange={e => setDraft(e.target.value)}
                                    className="w-full h-full min-h-[250px] bg-slate-50/50 dark:bg-slate-900/10 border divide-x border-border/50 rounded-xl p-5 text-[13px] leading-relaxed font-medium text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-border outline-none resize-none custom-scrollbar"
                                />
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 bg-white dark:bg-slate-800 shadow-sm border border-border rounded-lg text-muted-foreground hover:text-indigo-600"
                                        title="Copy to clipboard"
                                    >
                                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl bg-slate-50/30 dark:bg-slate-900/10 shrink-0 min-h-[250px]">
                                {isGenerating ? (
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 shadow-inner flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900/50">
                                            <Sparkles className="text-indigo-600 animate-spin-slow" size={24} />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">Consulting AI Model...</p>
                                    </div>
                                ) : (
                                    <div className="text-center opacity-50">
                                        <Mail size={32} className="mx-auto mb-3" />
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Hit Generate to craft a masterpiece</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 h-10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-border transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!draft}
                        onClick={handleSend}
                        className={clsx(
                            "px-6 h-10 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all",
                            draft
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 shadow-lg"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                        )}
                    >
                        Send Email <ArrowRight size={14} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
