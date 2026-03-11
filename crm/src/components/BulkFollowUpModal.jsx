'use client';
import { useState, useEffect } from 'react';
import { X, Sparkles, Send, Loader2, Check, RefreshCw, ChevronDown, ChevronUp, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const STATUS_COLORS = {
    New: 'bg-slate-100 text-slate-600',
    Contacted: 'bg-blue-100 text-blue-700',
    Qualified: 'bg-indigo-100 text-indigo-700',
    Negotiation: 'bg-amber-100 text-amber-700',
    Won: 'bg-green-100 text-green-700',
    Lost: 'bg-red-100 text-red-700',
};

export default function BulkFollowUpModal({ isOpen, onClose, selectedLeads, onSuccess }) {
    const [leadDrafts, setLeadDrafts] = useState({}); // { leadId: { lead, draft, prompt, loading, expanded, sent } }
    const [globalPrompt, setGlobalPrompt] = useState('');
    const [isSendingAll, setIsSendingAll] = useState(false);
    const [allSent, setAllSent] = useState(false);

    // On open, fetch leads and generate all drafts
    useEffect(() => {
        if (!isOpen || selectedLeads.length === 0) return;

        setAllSent(false);
        setLeadDrafts({});

        const initialDrafts = {};
        selectedLeads.forEach(lead => {
            initialDrafts[lead.id] = { lead, draft: '', prompt: '', loading: true, expanded: true, sent: false };
        });
        setLeadDrafts(initialDrafts);

        // Generate draft for each lead
        selectedLeads.forEach(lead => generateDraftForLead(lead, ''));
    }, [isOpen]);

    const generateDraftForLead = async (lead, customPrompt) => {
        setLeadDrafts(prev => ({
            ...prev,
            [lead.id]: { ...prev[lead.id], loading: true, draft: '' }
        }));

        try {
            const res = await fetch('/api/ai/generate-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId: lead.id, prompt: customPrompt || `Smart follow-up based on lead status: ${lead.status}` })
            });
            const data = await res.json();
            const draft = data.draft || 'Could not generate draft. Please write your own message.';

            // Simulate typing effect
            const tokens = draft.split(' ');
            let current = '';
            for (let i = 0; i < tokens.length; i++) {
                current += tokens[i] + ' ';
                setLeadDrafts(prev => ({
                    ...prev,
                    [lead.id]: { ...prev[lead.id], draft: current, loading: false }
                }));
                await new Promise(r => setTimeout(r, 12));
            }
        } catch {
            setLeadDrafts(prev => ({
                ...prev,
                [lead.id]: { ...prev[lead.id], draft: 'Failed to generate. Please write your message manually.', loading: false }
            }));
        }
    };

    const handleRegenerateOne = (lead) => {
        const prompt = leadDrafts[lead.id]?.prompt || '';
        generateDraftForLead(lead, prompt);
    };

    const handleUpdateDraft = (leadId, value) => {
        setLeadDrafts(prev => ({ ...prev, [leadId]: { ...prev[leadId], draft: value } }));
    };

    const handleUpdatePrompt = (leadId, value) => {
        setLeadDrafts(prev => ({ ...prev, [leadId]: { ...prev[leadId], prompt: value } }));
    };

    const handleToggleExpand = (leadId) => {
        setLeadDrafts(prev => ({ ...prev, [leadId]: { ...prev[leadId], expanded: !prev[leadId].expanded } }));
    };

    const handleApplyGlobalPrompt = () => {
        selectedLeads.forEach(lead => {
            setLeadDrafts(prev => ({ ...prev, [lead.id]: { ...prev[lead.id], prompt: globalPrompt } }));
            generateDraftForLead(lead, globalPrompt);
        });
    };

    const handleSendAll = async () => {
        setIsSendingAll(true);
        const leadIds = selectedLeads.map(l => l.id);
        const drafts = {};
        leadIds.forEach(id => { drafts[id] = leadDrafts[id]?.draft || ''; });

        try {
            const res = await fetch('/api/leads/bulk-followup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadIds, drafts })
            });

            if (res.ok) {
                // Mark all as sent visually
                const updated = {};
                Object.keys(leadDrafts).forEach(id => { updated[id] = { ...leadDrafts[id], sent: true }; });
                setLeadDrafts(updated);
                setAllSent(true);
                setTimeout(() => {
                    onSuccess?.();
                    onClose();
                }, 1500);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSendingAll(false);
        }
    };

    if (!isOpen) return null;

    const anyLoading = Object.values(leadDrafts).some(d => d.loading);
    const sentCount = Object.values(leadDrafts).filter(d => d.sent).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl w-full max-w-3xl border border-border/50 overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border/50 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <Sparkles size={16} className="text-white animate-pulse" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-white uppercase tracking-wide">AI Bulk Follow-Up</h2>
                            <p className="text-[10px] text-indigo-100 font-medium">
                                {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected · Review, edit & send
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-white/70 hover:bg-white/20 hover:text-white rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Global Prompt Bar */}
                <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-border/30 flex gap-2 items-center shrink-0">
                    <Sparkles size={13} className="text-indigo-500 shrink-0" />
                    <input
                        type="text"
                        value={globalPrompt}
                        onChange={e => setGlobalPrompt(e.target.value)}
                        placeholder="Apply a tone/goal to ALL leads — e.g. 'follow up after demo call'"
                        className="flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400 font-medium"
                        onKeyDown={e => e.key === 'Enter' && handleApplyGlobalPrompt()}
                    />
                    <button
                        onClick={handleApplyGlobalPrompt}
                        disabled={!globalPrompt.trim() || anyLoading}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all"
                    >
                        <RefreshCw size={11} /> Regenerate All
                    </button>
                </div>

                {/* Lead Drafts List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                    {Object.values(leadDrafts).map(({ lead, draft, prompt, loading, expanded, sent }) => (
                        <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={clsx(
                                "border rounded-xl overflow-hidden transition-all",
                                sent ? "border-green-300 bg-green-50/30 dark:bg-green-900/10" : "border-border/50 bg-white dark:bg-slate-950"
                            )}
                        >
                            {/* Lead Row Header */}
                            <div
                                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                onClick={() => handleToggleExpand(lead.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-black text-xs">
                                        {lead.name?.[0] || <User size={12} />}
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{lead.name}</span>
                                        {lead.company && <span className="text-[11px] text-muted-foreground ml-2">· {lead.company}</span>}
                                    </div>
                                    <span className={clsx("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", STATUS_COLORS[lead.status] || 'bg-slate-100 text-slate-600')}>
                                        {lead.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {sent && <span className="flex items-center gap-1 text-[10px] text-green-600 font-black uppercase tracking-widest"><Check size={12} /> Sent</span>}
                                    {loading && <Loader2 size={14} className="animate-spin text-indigo-500" />}
                                    {expanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                                </div>
                            </div>

                            {/* Expanded Draft Editor */}
                            {expanded && (
                                <div className="border-t border-border/30 px-4 pb-4 pt-3 space-y-3">
                                    {/* Custom Prompt for this lead */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={prompt}
                                            onChange={e => handleUpdatePrompt(lead.id, e.target.value)}
                                            placeholder={`Custom context for ${lead.name}... (optional)`}
                                            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-border/50 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 font-medium"
                                            onKeyDown={e => e.key === 'Enter' && handleRegenerateOne(lead)}
                                        />
                                        <button
                                            onClick={() => handleRegenerateOne(lead)}
                                            disabled={loading}
                                            className="px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 disabled:opacity-40 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <RefreshCw size={11} className={clsx(loading && "animate-spin")} />
                                            Regen
                                        </button>
                                    </div>

                                    {/* Draft Textarea */}
                                    {loading && !draft ? (
                                        <div className="flex items-center gap-2 py-4 text-slate-400">
                                            <Loader2 size={14} className="animate-spin text-indigo-500" />
                                            <span className="text-xs font-medium animate-pulse">Generating draft...</span>
                                        </div>
                                    ) : (
                                        <textarea
                                            value={draft}
                                            onChange={e => handleUpdateDraft(lead.id, e.target.value)}
                                            rows={6}
                                            className="w-full bg-slate-50/50 dark:bg-slate-900/30 border border-border/40 rounded-lg p-3 text-[12px] leading-relaxed font-medium text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500/30 outline-none resize-none custom-scrollbar"
                                        />
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3 shrink-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {anyLoading ? 'Generating drafts...' : allSent ? `✅ ${sentCount} follow-ups sent!` : `${selectedLeads.length} drafts ready to send`}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 h-10 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-border transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSendAll}
                            disabled={anyLoading || isSendingAll || allSent}
                            className={clsx(
                                "px-6 h-10 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all",
                                anyLoading || allSent
                                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95"
                            )}
                        >
                            {isSendingAll ? <Loader2 size={14} className="animate-spin" /> : allSent ? <Check size={14} /> : <Send size={14} />}
                            {isSendingAll ? 'Sending...' : allSent ? 'All Sent!' : `Send All (${selectedLeads.length})`}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
