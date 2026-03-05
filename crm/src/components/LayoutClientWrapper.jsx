'use client';

import '@/lib/i18n';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';

export default function LayoutClientWrapper({ children }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return (
            <main className="flex-1 overflow-y-auto relative bg-slate-50 dark:bg-slate-950">
                {children}
            </main>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-full w-full">
            {/* Mobile Navigation */}
            <MobileNav />

            {/* Desktop Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative bg-slate-50/50 dark:bg-slate-950/20">
                <div className="min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
