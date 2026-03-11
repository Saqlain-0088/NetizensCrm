'use client';

import Link from 'next/link';
import { Target, Users, TrendingUp, CheckSquare, BarChart3, ChevronDown, Shield, Clock, Zap, ArrowRight, PlayCircle, Star, Sparkles, Building2, Briefcase } from 'lucide-react';
import AnimatedPreview from '@/components/AnimatedPreview';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';

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
    { quote: "NetizensCRM has completely transformed how our sales team operates. We've seen a 40% increase in closed won deals in just one quarter.", author: 'Sarah Jenkins', role: 'VP of Sales', company: 'TechNova' },
    { quote: "The dark mode and intuitive interface make it a joy to use every day. We ditched Salesforce for this and haven't looked back.", author: 'David Chen', role: 'Founder', company: 'GrowthLabs' },
    { quote: "Finally, a CRM that doesn't feel like a chore to update. The automation features save my team at least 15 hours a week.", author: 'Elena Rodriguez', role: 'Sales Director', company: 'Acme Corp' },
];

const FAQ = [
    { q: 'Can I import my data from another CRM?', a: 'Yes! We offer a seamless one-click import tool that pulls your contacts, companies, and deals from major CRMs like HubSpot, Salesforce, and Excel spreadsheets.' },
    { q: 'Is there a free trial?', a: 'We offer a full-featured 14-day free trial on our Growth plan. No credit card is required to sign up.' },
    { q: 'What kind of support do you offer?', a: 'All plans include email support. Growth and Enterprise plans include priority 24/7 chat support and dedicated onboarding sessions.' },
];

export default function LandingPage() {
    const [openFaq, setOpenFaq] = useState(null);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

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
                                Sign in as User
                            </Link>
                            <Link href="/superadmin" className="hidden sm:inline-block text-sm font-medium text-slate-300 hover:text-white transition-colors border-l border-slate-700 pl-4">
                                Sign in as Admin
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

                <motion.div
                    style={{ opacity: heroOpacity, y: heroY }}
                    className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: [-2, 2, -2, 0] }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700 text-sm font-medium text-cyan-400 mb-8 backdrop-blur-md cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles size={16} />
                            </motion.div>
                            <span>Introducing NetizensCRM AI 2.0</span>
                        </motion.div>
                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
                            Close Deals <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500">
                                Faster Than Ever.
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12">
                            The intelligent CRM built for modern teams. Automate your workflow, visualize your pipeline, and scale your revenue without the clutter.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/login">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full sm:w-80 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-full flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all group"
                                >
                                    Sign in as User
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>
                            <Link href="/superadmin">
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full sm:w-80 px-8 py-4 bg-slate-900 border border-slate-700 hover:border-cyan-500 text-white font-bold rounded-full flex items-center justify-center gap-2 backdrop-blur-sm transition-all"
                                >
                                    <Shield size={20} className="text-cyan-400" />
                                    Sign in as Admin
                                </motion.button>
                            </Link>
                        </div>
                        <p className="mt-6 text-sm text-slate-500 gap-4 flex justify-center items-center">
                            <span className="flex items-center gap-1"><CheckSquare size={14} className="text-cyan-500" /> No credit card</span>
                            <span className="flex items-center gap-1"><CheckSquare size={14} className="text-cyan-500" /> 14-day trial</span>
                        </p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Dashboard Preview Section */}
            <section id="preview" className="pb-24 px-4 sm:px-6 relative z-10 -mt-10 lg:-mt-20">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="rounded-[2rem] p-2 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl shadow-purple-900/20 border border-slate-800"
                    >
                        <div className="bg-slate-950 rounded-[1.5rem] overflow-hidden border border-slate-800/50 relative">
                            {/* Mac Window Controls */}
                            <div className="absolute top-0 inset-x-0 h-12 bg-slate-900/80 backdrop-blur-md flex items-center px-4 gap-2 z-20 border-b border-slate-800">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                <div className="flex-1 text-center pr-12">
                                    <span className="text-xs font-medium text-slate-500 bg-slate-950 px-4 py-1.5 rounded-md border border-slate-800">app.netizenscrm.com</span>
                                </div>
                            </div>

                            <div className="pt-12 pointer-events-none opacity-90 scale-[0.98] origin-top">
                                <AnimatedPreview />
                            </div>

                            {/* Overlay Gradient for Fade effect */}
                            <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-950 to-transparent z-20 pointer-events-none" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 sm:px-6 border-t border-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="text-center max-w-3xl mx-auto mb-20"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 inline-block hover:scale-105 transition-transform cursor-default">scale.</span></h2>
                        <p className="text-lg text-slate-400">Ditch the complicated spreadsheets. NetizensCRM brings all your sales data into one intuitive, beautiful workspace.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    delay: i * 0.1,
                                    type: "spring",
                                    stiffness: 100,
                                    damping: 20
                                }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="group p-8 rounded-[2rem] bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition-all duration-300 relative overflow-hidden backdrop-blur-sm"
                            >
                                {/* Hover Glow animated */}
                                <motion.div
                                    className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500
                                    ${feature.color === 'cyan' ? 'from-cyan-500' : feature.color === 'purple' ? 'from-purple-500' : 'from-fuchsia-500'} 
                                    to-transparent pointer-events-none`}
                                />

                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, -5, 5, 0], scale: 1.1 }}
                                    transition={{ duration: 0.5 }}
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-slate-950 border border-slate-800 group-hover:border-${feature.color}-500/50 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-${feature.color}-500/20 transition-all relative z-10`}
                                >
                                    <feature.icon className={`w-8 h-8 text-${feature.color}-400 drop-shadow-[0_0_10px_currentColor] group-hover:scale-110 transition-transform`} />
                                </motion.div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors relative z-10">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-sm relative z-10">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats/Trust Section */}
            <section className="py-20 px-4 border-y border-slate-900 bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                    {[
                        { label: 'Active Users', value: '10,000+' },
                        { label: 'Deals Closed', value: '$2B+' },
                        { label: 'Time Saved/Wk', value: '15 hrs' },
                        { label: 'Customer Rating', value: '4.9/5' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="text-center"
                        >
                            <h4 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 mb-2">{stat.value}</h4>
                            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-4 sm:px-6 relative">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Loved by high-growth teams.</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm"
                            >
                                <div className="flex gap-1 mb-6">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} size={16} className="fill-cyan-500 text-cyan-500" />
                                    ))}
                                </div>
                                <p className="text-slate-300 mb-8 leading-relaxed">"{t.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center font-bold text-white text-lg">
                                        {t.author.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{t.author}</p>
                                        <p className="text-slate-400 text-sm">{t.role}, {t.company}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-4 sm:px-6 border-t border-slate-900 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Simple, transparent pricing.</h2>
                        <p className="text-lg text-slate-400">No hidden fees. No surprise charges. Start for free and scale when you're ready.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {PRICING.map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative p-8 rounded-[2rem] border ${plan.popular
                                    ? 'bg-slate-900 border-purple-500 z-10 scale-105 shadow-[0_0_40px_rgba(168,85,247,0.2)]'
                                    : 'bg-slate-900/50 border-slate-800'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 inset-x-0 flex justify-center">
                                        <span className="px-4 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 text-white text-xs font-bold tracking-wider uppercase">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-black text-white">{plan.price}</span>
                                    <span className="text-slate-400 font-medium">{plan.period}</span>
                                </div>
                                <ul className="space-y-4 mb-10">
                                    {plan.features.map(f => (
                                        <li key={f} className="flex items-start gap-3 text-slate-300">
                                            <CheckSquare size={20} className={plan.popular ? "text-cyan-400 shrink-0" : "text-slate-600 shrink-0"} />
                                            <span className="text-sm leading-tight">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href={plan.href}>
                                    <button className={`w-full py-4 rounded-xl font-bold transition-all ${plan.popular
                                        ? 'bg-white text-slate-950 hover:bg-slate-200'
                                        : 'bg-slate-800 text-white hover:bg-slate-700'
                                        }`}>
                                        {plan.cta}
                                    </button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-24 px-4 sm:px-6 relative border-t border-slate-900">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center tracking-tight">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {FAQ.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="rounded-2xl border border-slate-800 bg-slate-900/30 overflow-hidden backdrop-blur-sm"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between p-6 text-left font-semibold text-white hover:bg-slate-800/50 transition-colors"
                                >
                                    {item.q}
                                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-6 text-slate-400 leading-relaxed text-sm">
                                        {item.a}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-900 bg-slate-950 pt-16 pb-8 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">L</span>
                            </div>
                            <span className="font-bold text-white">NetizensCRM</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-medium text-slate-400">
                            <a href="#" className="hover:text-white transition-colors">Product</a>
                            <a href="#" className="hover:text-white transition-colors">Pricing</a>
                            <a href="#" className="hover:text-white transition-colors">About Us</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                        <div className="flex gap-4">
                            <button className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                            </button>
                            <button className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-purple-400 hover:border-purple-400/50 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            </button>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
                        <p>© 2026 NetizensCRM. All rights reserved.</p>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
