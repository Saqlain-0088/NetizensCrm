'use client';

import '@/lib/i18n';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import UpgradeBanner from '@/components/UpgradeBanner';
import AIChatBot from '@/components/AIChatBot';

export default function LayoutClientWrapper({ children }) {
    const pathname = usePathname();
    const isSuperAdminRoute = pathname.startsWith('/superadmin');
    const isPublicLayout = pathname === '/' || pathname === '/login' || pathname.startsWith('/signup');

    if (isPublicLayout || isSuperAdminRoute) {
        return (
            <main className="min-h-screen w-full">
                {children}
            </main>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-full w-full relative">
            <MobileNav />
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative bg-slate-50/50 dark:bg-slate-950/20 flex flex-col">
                <UpgradeBanner />
                <div className="min-h-full flex-1">
                    {children}
                </div>
            </main>
            <AIChatBot />
        </div>
    );
}
