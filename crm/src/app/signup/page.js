'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, Building2, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

function SignupForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planParam = searchParams.get('plan') || 'free';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        company: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await res.json();

            if (res.ok) {
                setStep(2);
            } else {
                setError(data.error || 'Failed to send OTP. Please try again.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, plan: planParam, otp })
            });
            const data = await res.json();

            if (res.ok) {
                router.push('/dashboard');
                router.refresh();
            } else {
                setError(data.error || 'Sign up failed. Please try again.');
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
                className="w-full max-w-lg"
            >
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-200 group-hover:scale-110 transition-transform">L</div>
                        <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">NetizensCRM</span>
                    </Link>
                </div>

                <Card className="border-slate-200/60 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-3xl overflow-hidden">
                    <CardHeader className="space-y-1 text-center bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-3xl font-extrabold tracking-tight text-slate-900">Create your account</CardTitle>
                        <CardDescription className="text-slate-600">
                            Start your 14-day free trial. No credit card required.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-8">
                        {step === 1 ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                                            <Input
                                                id="name"
                                                name="name"
                                                type="text"
                                                placeholder="John Doe"
                                                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-violet-500 focus:border-violet-500"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="company" className="text-sm font-semibold text-slate-700">Company Name</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                                            <Input
                                                id="company"
                                                name="company"
                                                type="text"
                                                placeholder="Acme Inc"
                                                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-violet-500 focus:border-violet-500"
                                                value={formData.company}
                                                onChange={handleChange}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
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
                                                minLength={6}
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm Password</label>
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-violet-500 focus:border-violet-500"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                                        required
                                    />
                                    <label htmlFor="terms" className="text-xs text-slate-600">
                                        I agree to the <span className="text-violet-600 font-semibold hover:underline cursor-pointer">Terms</span> and <span className="text-violet-600 font-semibold hover:underline cursor-pointer">Privacy Policy</span>
                                    </label>
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
                                    {loading ? <Loader2 className="mr-2 animate-spin" size={18} /> : 'Continue'}
                                    {!loading && <ArrowRight className="ml-2" size={18} />}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleSignup} className="space-y-4">
                                <div className="space-y-4 text-center">
                                    <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Verify your email</h3>
                                    <p className="text-sm text-slate-600">
                                        We sent a 6-digit verification code to <span className="font-semibold text-slate-900">{formData.email}</span>
                                    </p>

                                    <div className="space-y-2 text-left mt-6">
                                        <label htmlFor="otp" className="text-sm font-semibold text-slate-700">Verification Code</label>
                                        <Input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            placeholder="123456"
                                            maxLength={6}
                                            className="h-14 text-center text-2xl tracking-widest font-bold rounded-xl border-slate-200 focus:ring-violet-500 focus:border-violet-500"
                                            value={otp}
                                            onChange={(e) => {
                                                setOtp(e.target.value.replace(/\D/g, ''));
                                                setError('');
                                            }}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="p-3 rounded-lg bg-red-50 border border-red-200 text-left"
                                        >
                                            <p className="text-xs font-medium text-red-600">{error}</p>
                                        </motion.div>
                                    )}

                                    <Button className="w-full h-12 mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold rounded-xl shadow-lg shadow-violet-200 transition-all transform hover:scale-[1.02]" disabled={loading || otp.length < 6}>
                                        {loading ? <Loader2 className="mr-2 animate-spin" size={18} /> : 'Create Account'}
                                        {!loading && <ArrowRight className="ml-2" size={18} />}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors mt-4 inline-block"
                                    >
                                        Back to details
                                    </button>
                                </div>
                            </form>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/30 pt-6 pb-8">
                        <p className="text-sm text-center text-slate-600">
                            Already have an account? <Link href="/login" className="font-bold text-violet-600 hover:text-violet-700 transition-colors">Login</Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SignupForm />
        </Suspense>
    );
}
