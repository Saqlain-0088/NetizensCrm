'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building, Target, Mail, Phone, Zap } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function NewLeadPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        value: 0,
        source: 'Manual',
        priority: 'Medium'
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/leads');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Link href="/leads" className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-indigo-600 transition-colors">
                <ArrowLeft size={16} /> Return to Pipeline
            </Link>

            <div className="card bg-white dark:bg-slate-950 p-10 border-0 ring-1 ring-border/50 shadow-xl">
                <div className="mb-10">
                    <h1 className="text-2xl font-black tracking-tight mb-2">Initialize New Prospect</h1>
                    <p className="text-sm text-muted-foreground font-medium">Provision a new entry into the Lumina CRM intelligence layer.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Contact Name</label>
                            <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors">
                                    <Target size={16} />
                                </span>
                                <input
                                    required
                                    type="text"
                                    className="input pl-10 h-11"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Satya Nadella"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Organization</label>
                            <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors">
                                    <Building size={16} />
                                </span>
                                <input
                                    required
                                    type="text"
                                    className="input pl-10 h-11"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="e.g. Microsoft"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Primary Email</label>
                            <div className="relative group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors">
                                    <Mail size={16} />
                                </span>
                                <input
                                    type="email"
                                    className="input pl-10 h-11"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="satya@microsoft.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Secondary Identification (Phone)</label>
                            <div className="relative flex items-center bg-white dark:bg-slate-900 h-11 rounded-lg border border-input focus-within:ring-2 focus-within:ring-ring focus-within:border-indigo-500 overflow-hidden px-3 shadow-sm transition-all group">
                                <span className="text-muted-foreground mr-2 shrink-0 group-focus-within:text-indigo-600 transition-colors">
                                    <Phone size={14} />
                                </span>
                                <PhoneInput
                                    international
                                    defaultCountry="US"
                                    value={formData.phone}
                                    onChange={value => setFormData({ ...formData, phone: value })}
                                    className="w-full h-full pb-0 [&>input]:h-full [&>input]:w-full [&>input]:bg-transparent [&>input]:border-none [&>input]:outline-none [&>input]:text-sm [&>input]:text-slate-900 dark:[&>input]:text-slate-100"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Est. Deal Value (USD)</label>
                            <input
                                required
                                type="number"
                                className="input h-11"
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: parseInt(e.target.value) })}
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Lead Source</label>
                            <select
                                className="input h-11 px-4 font-bold text-slate-700 cursor-pointer"
                                value={formData.source}
                                onChange={e => setFormData({ ...formData, source: e.target.value })}
                            >
                                <option value="Manual">Manual Entry</option>
                                <option value="Referral">Referral</option>
                                <option value="Website">Website</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Partner">Partner</option>
                                <option value="Outbound">Outbound</option>
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1 text-center block">Urgency Level</label>
                            <div className="flex gap-4">
                                {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: p })}
                                        className={clsx(
                                            "flex-1 py-3 rounded-lg border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                            formData.priority === p
                                                ? "border-indigo-600 bg-indigo-50 text-indigo-600 ring-4 ring-indigo-100/50 shadow-sm"
                                                : "border-slate-100 bg-slate-50 text-muted-foreground hover:border-slate-200"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border/50 flex justify-end gap-3">
                        <Link href="/leads" className="btn btn-outline h-11 px-8">Discard</Link>
                        <button type="submit" className="btn btn-primary h-11 px-10 font-black shadow-lg shadow-indigo-200" disabled={submitting}>
                            {submitting ? 'SYNCHRONIZING...' : 'INITIALIZE LEAD'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
