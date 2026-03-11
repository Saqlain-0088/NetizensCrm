'use client';
import { useEffect, useState } from 'react';
import { IndianRupee, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function SuperBilling() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/superadmin/billing').then(r => r.json()).then(d => { setPayments(Array.isArray(d) ? d : []); setLoading(false); });
    }, []);

    const totalRevenue = payments.filter(p => p.status === 'success').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const failedCount = payments.filter(p => p.status === 'failed').length;

    const statusIcon = { success: <CheckCircle2 size={14} className="text-emerald-400" />, failed: <XCircle size={14} className="text-red-400" />, pending: <Clock size={14} className="text-amber-400" /> };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-emerald-400' },
                    { label: 'Total Transactions', value: payments.length, color: 'text-indigo-400' },
                    { label: 'Failed Payments', value: failedCount, color: 'text-red-400' },
                ].map(c => (
                    <div key={c.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                        <div className={`text-2xl font-black ${c.color}`}>{c.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Payments Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-800">
                            {['Invoice', 'Company', 'Plan', 'Amount', 'Method', 'Status', 'Date'].map(h => (
                                <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan={7} className="text-center py-16 text-slate-500">Loading...</td></tr>
                            : payments.length === 0 ? <tr><td colSpan={7} className="text-center py-16 text-slate-500">No payment records yet</td></tr>
                                : payments.map(p => (
                                    <tr key={p.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-4 text-xs font-mono text-indigo-400">{p.invoice_number || `INV-${p.id}`}</td>
                                        <td className="px-5 py-4 text-sm text-slate-300 font-medium">{p.company_name || '—'}</td>
                                        <td className="px-5 py-4 text-xs text-slate-400">{p.plan_name || '—'}</td>
                                        <td className="px-5 py-4 text-sm font-black text-slate-100">₹{parseFloat(p.amount).toLocaleString('en-IN')}</td>
                                        <td className="px-5 py-4 text-xs text-slate-400">{p.payment_method || '—'}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {statusIcon[p.status] || statusIcon.pending}
                                                <span className="text-xs font-bold capitalize text-slate-300">{p.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
