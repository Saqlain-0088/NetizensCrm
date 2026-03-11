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

    const statusIcon = {
        success: <CheckCircle2 size={14} className="text-emerald-500" />,
        failed: <XCircle size={14} className="text-red-500" />,
        pending: <Clock size={14} className="text-amber-500" />
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { label: 'Global Gross Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
                    { label: 'Cleared Transactions', value: payments.length, color: 'text-indigo-600', bg: 'bg-indigo-50/50' },
                    { label: 'Flagged Failures', value: failedCount, color: 'text-red-600', bg: 'bg-red-50/50' },
                ].map(c => (
                    <div key={c.label} className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-sm`}>
                        <div className={`text-2xl font-black tracking-tight ${c.color}`}>{c.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Payments Table */}
            <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80">
                                {['Transaction ID', 'Corporate Body', 'Tier', 'Gross Amount', 'Gateway', 'Fulfillment', 'Timestamp'].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-2">
                                        <RefreshCw size={24} className="animate-spin text-indigo-500" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reconciling Ledgers...</span>
                                    </div>
                                </td></tr>
                            ) : payments.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-20 text-slate-400 uppercase text-[10px] font-black tracking-widest">No transaction history detected</td></tr>
                            ) : payments.map(p => (
                                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-5 py-5 text-xs font-black text-indigo-600 font-mono tracking-tighter">{p.invoice_number || `TXN-${p.id}`}</td>
                                    <td className="px-5 py-5">
                                        <div className="text-sm font-bold text-slate-900">{p.company_name || 'Individual User'}</div>
                                    </td>
                                    <td className="px-5 py-5"><span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{p.plan_name || 'BASIC'}</span></td>
                                    <td className="px-5 py-5 text-sm font-black text-slate-900">₹{parseFloat(p.amount).toLocaleString('en-IN')}</td>
                                    <td className="px-5 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.payment_method || 'RAZORPAY'}</td>
                                    <td className="px-5 py-5">
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border shadow-sm ${p.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : p.status === 'failed' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {statusIcon[p.status] || statusIcon.pending}
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{p.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 text-xs font-bold text-slate-400">{new Date(p.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
