'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (res.ok) {
                router.push(callbackUrl);
                router.refresh();
            } else {
                setError(data.error || 'Invalid email or password');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-800/20 -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform">L</div>
                        <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">NetizensCRM</span>
                    </Link>
                </div>

                <Card className="border-slate-200/60 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-3xl overflow-hidden">
                    <CardHeader className="space-y-1 text-center bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome Back</CardTitle>
                        <CardDescription className="text-slate-600">
                            Log in to manage your sales pipeline.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-8">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2 text-left">
                                <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-violet-500 focus:border-violet-500"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                                    <button
                                        type="button"
                                        className="text-xs text-violet-600 hover:text-violet-700 font-bold transition-colors"
                                        onClick={() => alert('Demo Passwords:\nadmin@netizenscrm.com -> admin123\nOthers -> password123')}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-violet-500 focus:border-violet-500"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                                    />
                                    <label htmlFor="remember" className="text-xs text-slate-600 font-medium">Remember me</label>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3 rounded-lg bg-red-50 border border-red-200"
                                >
                                    <p className="text-xs font-medium text-red-600">{error}</p>
                                </motion.div>
                            )}

                            <Button className="w-full h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all transform hover:scale-[1.02]" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 animate-spin" size={18} /> : 'Login'}
                                {!loading && <ArrowRight className="ml-2" size={18} />}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/30 pt-6 pb-8">
                        <p className="text-sm text-center text-slate-600">
                            Don&apos;t have an account? <Link href="/signup" className="font-bold text-violet-600 hover:text-violet-700 transition-colors">Create Account</Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
