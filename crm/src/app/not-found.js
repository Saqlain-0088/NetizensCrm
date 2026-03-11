'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="text-center max-w-md">
                <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-2">404</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">Page not found</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    >
                        <Home size={18} /> Go to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft size={18} /> Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
