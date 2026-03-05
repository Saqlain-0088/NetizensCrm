'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, Lock, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useTranslation } from 'react-i18next';

export default function LoginPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const router = useRouter();

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
                router.push('/');
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
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Sparkles size={24} />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Lumina CRM</span>
                    </div>
                </div>

                <Card className="border-border/50 shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {t('login.title')}
                        </CardTitle>
                        <CardDescription>
                            {t('login.subtitle')}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2 text-left">
                                <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('login.email')}</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-10 h-11"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 text-left">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('login.password')}</label>
                                    <button
                                        type="button"
                                        className="text-xs text-indigo-600 hover:underline font-medium"
                                        onClick={() => alert('Demo Passwords:\nadmin@lumina.io -> admin123\nOthers -> password123')}
                                    >
                                        {t('login.forgotPassword')}
                                    </button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10 h-11"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                                >
                                    <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
                                </motion.div>
                            )}

                            <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 mt-2" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 animate-spin" size={18} /> : t('login.signIn')}
                                {!loading && <ArrowRight className="ml-2" size={18} />}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 border-t border-border/50 pt-4">
                        <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
                            {t('login.agreement')} <span className="underline underline-offset-4 hover:text-foreground cursor-pointer">{t('login.terms')}</span> {t('login.agreement') === 'By clicking continue, you agree to our' ? 'and' : 'आणि'} <span className="underline underline-offset-4 hover:text-foreground cursor-pointer">{t('login.privacy')}</span>.
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
