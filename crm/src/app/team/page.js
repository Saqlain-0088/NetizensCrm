'use client';
import { useState, useEffect } from 'react';
import {
    UserPlus, Mail, Shield, MoreHorizontal,
    Search, Filter, CheckCircle2, Circle,
    Loader2, Trash2, ArrowRight, Zap, Phone, Edit2
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function TeamPage() {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'Agent', phone: '', status: 'Active' });
    const [isSaving, setIsSaving] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState(null);

    const fetchTeam = async () => {
        try {
            const res = await fetch('/api/team');
            const data = await res.json();
            setTeam(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAutoAssign = async () => {
        setIsSaving(true);
        try {
            await fetch('/api/team/auto-assign', { method: 'POST' });
            fetchTeam();
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => { fetchTeam(); }, []);

    const handleAddMember = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const url = editingMemberId ? `/api/team/${editingMemberId}` : '/api/team';
        const method = editingMemberId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowAddModal(false);
                setFormData({ name: '', email: '', role: 'Agent', phone: '', status: 'Active' });
                setEditingMemberId(null);
                fetchTeam();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteMember = async (id) => {
        if (!confirm('Permanent deletion of this agent? All assignments will break.')) return;
        try {
            await fetch(`/api/team/${id}`, { method: 'DELETE' });
            fetchTeam();
        } catch (error) { console.error(error); }
    };

    const openEditModal = (member) => {
        setFormData({
            name: member.name,
            email: member.email,
            role: member.role,
            phone: member.phone || '',
            status: member.status || 'Active'
        });
        setEditingMemberId(member.id);
        setShowAddModal(true);
    };
    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight uppercase">Team Consortium</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Manage internal agents and lead assignment permissions.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleAutoAssign}
                        disabled={isSaving}
                        className="btn btn-outline h-11 px-6 rounded-xl font-black text-xs tracking-widest flex items-center gap-3 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                        <Zap size={16} fill="currentColor" /> AUTO-DISTRIBUTE
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary h-11 px-6 rounded-xl font-black text-xs tracking-widest flex items-center gap-3 shadow-lg shadow-indigo-100"
                    >
                        <UserPlus size={16} /> ONBOARD COMPONENT
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard label="TOTAL AGENTS" value={team.length} sub="Capacity: 85%" />
                <StatCard label="ACTIVE NOW" value={team.filter(t => t.status === 'Active').length} sub="Real-time sync" isGreen />
                <StatCard label="AVG RESPONSE" value="12m" sub="-2s from yesterday" />
                <StatCard label="ROLES" value="3" sub="Enterprise Hierarchy" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {team.map((member) => (
                    <div key={member.id} className="card p-6 bg-white dark:bg-slate-950 border-0 ring-1 ring-border/50 hover:ring-indigo-500/30 transition-all flex flex-col justify-between group">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-lg border border-border">
                                    {member.name.charAt(0)}
                                </div>
                                <div className={clsx(
                                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                                    member.status === 'Active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                                )}>
                                    {member.status}
                                </div>
                            </div>
                            <h3 className="text-base font-black uppercase leading-none">{member.name}</h3>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                                <Shield size={10} className="text-indigo-600" /> {member.role}
                            </div>
                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                                    <Mail size={12} /> {member.email}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                                    <Phone size={12} /> {member.phone || 'No WhatsApp'}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                            <Link href={`/team/${member.id}`} prefetch={false} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest flex items-center gap-1">
                                View Intelligence <ArrowRight size={10} />
                            </Link>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => openEditModal(member)}
                                    className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors"
                                ><Edit2 size={13} /></button>
                                <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                ><Trash2 size={13} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-950 rounded-3xl w-full max-w-md shadow-2xl border border-border overflow-hidden"
                    >
                        <div className="px-8 py-6 border-b border-border bg-slate-50/50 flex justify-between items-center">
                            <h2 className="text-lg font-black uppercase tracking-tight">{editingMemberId ? 'Modify Agent Intel' : 'Onboard New Member'}</h2>
                            <button onClick={() => { setShowAddModal(false); setEditingMemberId(null); }} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleAddMember} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Identity</label>
                                    <input
                                        required
                                        className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        placeholder="James Wilson"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Work Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        placeholder="james@enterprise.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">WhatsApp Number</label>
                                    <input
                                        required
                                        className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        placeholder="+1 234 567 890"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Organizational Role</label>
                                    <select
                                        className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option>Lead Closer</option>
                                        <option>Account Executive</option>
                                        <option>Sales Development</option>
                                        <option>Agent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Operational Status</label>
                                    <select
                                        className="w-full mt-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Operational (Active)</option>
                                        <option value="Away">Standby (Away)</option>
                                        <option value="Inactive">Deactivated (Inactive)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => { setShowAddModal(false); setEditingMemberId(null); }} className="btn btn-outline flex-1 h-11 rounded-xl font-black text-xs">Abord</button>
                                <button type="submit" disabled={isSaving} className="btn btn-primary flex-1 h-11 rounded-xl font-black text-xs tracking-widest">
                                    {isSaving ? 'Synching...' : editingMemberId ? 'UPDATE IDENTITY' : 'CONFIRM ONBOARD'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, sub, isGreen }) {
    return (
        <div className="card p-5 bg-white dark:bg-slate-950 border-0 ring-1 ring-border/50 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</div>
            <div className="flex items-end justify-between">
                <div className="text-3xl font-black tracking-tight">{value}</div>
                <div className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded", isGreen ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600")}>
                    {sub}
                </div>
            </div>
        </div>
    );
}

