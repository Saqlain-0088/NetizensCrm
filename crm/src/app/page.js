'use client';

import Link from 'next/link';
import { Target, Users, TrendingUp, CheckSquare, BarChart3, ChevronDown, Shield, Clock, Zap, ArrowRight, PlayCircle, Star, Sparkles, Building2, Briefcase, ChevronRight } from 'lucide-react';
import AnimatedPreview from '@/components/AnimatedPreview';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

const FEATURES = [
    { icon: Target, title: 'Lead Management', desc: 'Capture, track, and score leads automatically. Never let a potential opportunity slip through the cracks.', color: 'cyan' },
    { icon: TrendingUp, title: 'Sales Pipeline', desc: 'Visualize your entire sales process with customizable deal stages and real-time revenue forecasting.', color: 'purple' },
    { icon: Users, title: 'Contact Book', desc: 'A centralized, secure database for all your customers with rich interaction histories.', color: 'fuchsia' },
    { icon: CheckSquare, title: 'Smart Follow-ups', desc: 'Automated task generation and intelligent reminders ensure you always follow up at the perfect time.', color: 'cyan' },
    { icon: BarChart3, title: 'Advanced Analytics', desc: 'Deep insights into your team\'s performance with interactive dashboards and custom reports.', color: 'purple' },
    { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption and granular role-based access control to keep your business data safe.', color: 'fuchsia' },
];

const PRICING = [
    { name: 'Starter', price: 'INR 999', period: '/mo', features: ['Up to 3 users', 'Basic Lead management', 'Visual Pipeline', 'Standard Support'], cta: 'Start Free Trial', href: '/signup?plan=starter', popular: false },
    { name: 'Growth', price: 'INR 2499', period: '/mo', features: ['Up to 10 users', 'Sales automation', 'Advanced Analytics', 'Priority 24/7 Support'], cta: 'Start Free Trial', href: '/signup?plan=growth', popular: true },
    { name: 'Enterprise', price: 'Custom', period: 'pricing', features: ['Unlimited users', 'Custom integrations', 'Dedicated Account Manager', 'SLA Guarantee'], cta: 'Contact Sales', href: '/signup?plan=enterprise', popular: false },
];

const TESTIMONIALS = [
    { quote: "NetizensCRM has completely transformed how our sales team operates. We\'ve seen a 40% increase in closed won deals in just one quarter.", author: 'Sarah Jenkins', role: 'VP of Sales', company: 'TechNova' },
    { quote: "The dark mode and intuitive interface make it a joy to use every day. We ditched Salesforce for this and haven\'t looked back.", author: 'David Chen', role: 'Founder', company: 'GrowthLabs' },
    { quote: "Finally, a CRM that doesn\'t feel like a chore to update. The automation features save my team at least 15 hours a week.", author: 'Elena Rodriguez', role: 'Sales Director', company: 'Acme Corp' },
];

const FAQ = [
    { q: 'Can I import my data from another CRM?', a: 'Yes! We offer a seamless one-click import tool that pulls your contacts, companies, and deals from major CRMs like HubSpot, Salesforce, and Excel spreadsheets.' },
    { q: 'Is there a free trial?', a: 'We offer a full-featured 14-day free trial on our Growth plan. No credit card is required to sign up.' },
    { q: 'What kind of support do you offer?', a: 'All plans include email support. Growth and Enterprise plans include priority 24/7 chat support and dedicated onboarding sessions.' },
];

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState(null);
    const [plans, setPlans] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    useEffect(() => {
        fetch('/api/plans').then(r => r.json()).then(d => {
            if (Array.isArray(d)) setPlans(d);
        }).catch(() => { });

        fetch('/api/announcements').then(r => r.json()).then(d => {
            if (Array.isArray(d)) setAnnouncements(d);
        }).catch(() => { });
    }, []);

    // Scroll effects
    const navBackground = useTransform(scrollYProgress, [0, 0.05], ["rgba(2, 6, 23, 0)", "rgba(2, 6, 23, 0.8)"]);
    const navBorder = useTransform(scrollYProgress, [0, 0.05], ["rgba(30, 41, 59, 0)", "rgba(30, 41, 59, 0.5)"]);
    const navBackdrop = useTransform(scrollYProgress, [0, 0.05], ["blur(0px)", "blur(16px)"]);

    const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.15], [0, 100]);
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-purple-500/30 selection:text-purple-200">
            {/* Nav */}
            <motion.nav
                style={{ backgroundColor: navBackground, borderBottomColor: navBorder, backdropFilter: navBackdrop, WebkitBackdropFilter: navBackdrop }}
                className="fixed top-0 inset-x-0 z-50 transition-colors duration-300"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                        >
                            <span className="text-white font-bold text-lg leading-none">N</span>
                        </motion.div>
                        <span className="font-bold text-xl text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-500 transition-all">NetizensCRM</span>
                    </Link>
                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                            <a href="#features" className="text-slate-300 hover:text-cyan-400 transition-colors">Features</a>
                            <a href="#pricing" className="text-slate-300 hover:text-purple-400 transition-colors">Pricing</a>
                            <a href="#faq" className="text-slate-300 hover:text-fuchsia-400 transition-colors">FAQ</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="hidden sm:inline-block text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                Sign In
                            </Link>
                            <Link href="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-2.5 bg-white text-slate-950 text-sm font-bold rounded-full hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                >
                                    Get Started
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Playful Floating Background Elements with Parallax */}
                <motion.div
                    style={{ y: backgroundY }}
                    className="absolute inset-0 pointer-events-none"
                >
                    <motion.div
                        animate={{
                            y: [0, -30, 0],
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"
                    />
                    <motion.div
                        animate={{
                            y: [0, 40, 0],
                            scale: [1, 1.2, 1],
                            rotate: [0, -5, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-cyan-600/15 rounded-full blur-[80px] pointer-events-none"
                    />
                    <motion.div
                        animate={{
                            x: [0, -50, 0],
                            y: [0, -20, 0]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-fuchsia-600/15 rounded-full blur-[90px] pointer-events-none"
                    />
                </motion.div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-40 text-center">
                    <AnimatePresence mode='wait'>
                        {announcements.length > 0 && (
                            <motion.div
                                key={announcements[0].id}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="flex justify-center mb-10"
                            >
                                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full shadow-2xl">
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${announcements[0].type === 'error' ? 'bg-red-500' : announcements[0].type === 'warning' ? 'bg-amber-500' : 'bg-cyan-500'}`}></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">{announcements[0].type || 'Update'}</span>
                                    <div className="w-px h-3 bg-white/20"></div>
                                    <span className="text-xs font-medium text-white/90 tracking-wide">{announcements[0].title}</span>
                                    <ChevronRight size={14} className="text-white/40" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wider uppercase mb-8">
                            <Sparkles size={14} />
                            <span>AI-Powered Sales Transformation</span>
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-black text-white leading-[0.9] tracking-tight mb-8">
                            CLOSE DEALS <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500">WITHOUT FRICTION.</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            The intelligent CRM that scores leads, suggests follow-ups, and predicts revenue using proprietary AI. Built for teams that move fast.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Link href="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-10 py-5 bg-white text-slate-950 font-black rounded-2xl flex items-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)] transition-all uppercase tracking-widest text-xs"
                                >
                                    Start Free Trial <ArrowRight size={18} />
                                </motion.button>
                            </Link>
                            <button className="px-10 py-5 bg-slate-900/50 text-white font-black rounded-2xl border border-slate-800 flex items-center gap-3 hover:bg-slate-800 transition-all uppercase tracking-widest text-xs backdrop-blur-sm">
                                <PlayCircle size={18} /> Watch Demo
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Main Preview Component */}
                <div className="relative max-w-6xl mx-auto px-6 -mt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative rounded-3xl border border-white/10 bg-slate-900/50 backdrop-blur-3xl p-4 shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
                    >
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/30 blur-[60px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/30 blur-[60px] rounded-full pointer-events-none" />
                        <AnimatedPreview />
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-40 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tight">Everything you need to <br /><span className="text-cyan-400 italic">dominate</span> your market.</h2>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">We built the features sales teams actually use. No fluff, just pure efficiency tools designed for high-velocity teams.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-8 rounded-3xl bg-slate-900/30 border border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-900/50"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                    <f.icon className={f.color === 'cyan' ? "text-cyan-400" : f.color === 'purple' ? "text-purple-400" : "text-fuchsia-400"} size={24} />
                                </div>
                                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{f.title}</h3>
                                <p className="text-slate-400 leading-relaxed font-medium">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-40 bg-slate-900/20 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 uppercase tracking-tight">Flexible plans for <br />every stage of growth.</h2>
                        <p className="text-lg text-slate-400">No hidden fees. No surprise charges. Start for free and scale when you&apos;re ready.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {(plans.length > 0 ? plans : PRICING).map((plan, i) => {
                            const isPopular = plan.popular || (plans.length > 0 && Math.floor(plans.length / 2) === i);
                            const features = Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || []));

                            return (
                                <motion.div
                                    key={plan.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`relative p-8 rounded-[2rem] border transition-all duration-500
                                        ${isPopular
                                            ? 'bg-slate-900 border-purple-500/50 z-10 scale-105 shadow-[0_0_50px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20'
                                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 backdrop-blur-sm'
                                        }`}
                                >
                                    {isPopular && (
                                        <div className="absolute -top-4 inset-x-0 flex justify-center">
                                            <span className="px-5 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-[10px] font-black tracking-widest uppercase shadow-lg shadow-purple-500/20">
                                                Best Value
                                            </span>
                                        </div>
                                    )}
                                    <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1 mb-8">
                                        <span className="text-4xl font-black text-white">
                                            {typeof plan.monthly_price === 'number' ? `₹${plan.monthly_price}` : plan.price}
                                        </span>
                                        <span className="text-slate-500 font-bold text-sm tracking-wide">{plan.period || '/mo'}</span>
                                    </div>
                                    <ul className="space-y-4 mb-10">
                                        {features.map((f, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-slate-400 group/item">
                                                <div className={`mt-0.5 rounded-full p-0.5 ${isPopular ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-600'}`}>
                                                    <CheckSquare size={14} className="shrink-0" />
                                                </div>
                                                <span className="text-[13px] font-medium leading-tight group-hover/item:text-slate-200 transition-colors">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href={plan.href || `/signup?plan=${plan.id || plan.name.toLowerCase()}`}>
                                        <button className={`w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all shadow-xl active:scale-95
                                            ${isPopular
                                                ? 'bg-white text-slate-950 hover:bg-slate-100 shadow-white/5'
                                                : 'bg-slate-800 text-white hover:bg-slate-700 shadow-black/20'
                                            }`}>
                                            {plan.cta || 'Start Free Trial'}
                                        </button>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-40 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-4xl lg:text-7xl font-black text-white mb-8 tracking-tighter uppercase leading-none">Loved by the <br />world&apos;s best <br /><span className="text-purple-500 italic">sales teams.</span></h2>
                            <p className="text-lg text-slate-400 mb-12 max-w-lg font-medium">Join 5,000+ organizations scaling their revenue with NetizensCRM. Built by sales people, for sales people.</p>
                            <div className="flex gap-4">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={20} className="text-amber-400 fill-amber-400" />)}
                                <span className="ml-2 font-black text-white">4.9/5 Average Rating</span>
                            </div>
                        </div>
                        <div className="grid gap-6">
                            {TESTIMONIALS.map((t, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 relative group hover:border-purple-500/30 transition-all"
                                >
                                    <p className="text-xl font-medium text-slate-200 mb-6 italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-black text-white uppercase">{t.author[0]}</div>
                                        <div>
                                            <div className="font-black text-white uppercase tracking-tight">{t.author}</div>
                                            <div className="text-xs font-black uppercase tracking-widest text-slate-500">{t.role} @ {t.company}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="p-16 rounded-[4rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-center relative overflow-hidden shadow-[0_50px_100px_rgba(124,58,237,0.3)]"
                    >
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full animate-ping" />
                            <div className="absolute bottom-10 right-10 w-60 h-60 border border-white rounded-full animate-pulse" />
                        </div>
                        <h2 className="text-4xl lg:text-7xl font-black text-white mb-8 tracking-tighter uppercase leading-none">Ready to break <br />your sales records?</h2>
                        <p className="text-xl text-white/80 mb-12 max-w-xl mx-auto font-medium">Get started with a 14-day free trial. No credit card required. Cancel anytime.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/signup" className="w-full sm:w-auto">
                                <button className="w-full px-12 py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 transition-all shadow-xl uppercase tracking-widest text-xs">Start Your Free Trial</button>
                            </Link>
                            <Link href="/login" className="w-full sm:w-auto">
                                <button className="w-full px-12 py-5 bg-transparent text-white border-2 border-white/30 font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs">Contact Sales</button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-40">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-4xl lg:text-6xl font-black text-white mb-16 text-center uppercase tracking-tight">Got Questions? <br /><span className="text-fuchsia-500 italic">We have answers.</span></h2>
                    <div className="space-y-4">
                        {FAQ.map((item, i) => (
                            <div key={i} className="rounded-3xl border border-slate-800 bg-slate-900/30 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full p-8 text-left flex items-center justify-between hover:bg-slate-800/30 transition-all"
                                >
                                    <span className="text-xl font-black text-white uppercase tracking-tight">{item.q}</span>
                                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }}>
                                        <ChevronDown className="text-slate-500" />
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-8 pb-8"
                                        >
                                            <p className="text-slate-400 leading-relaxed font-medium">{item.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">N</span>
                            </div>
                            <span className="font-bold text-xl text-white">NetizensCRM</span>
                        </div>
                        <div className="flex gap-8 text-sm font-black uppercase tracking-widest text-slate-500">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                        </div>
                        <div className="text-sm font-black uppercase tracking-widest text-slate-600">
                            © 2026 NetizensCRM. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
