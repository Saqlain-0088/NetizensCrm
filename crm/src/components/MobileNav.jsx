'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Sparkles } from 'lucide-react';
import SidebarContent from './SidebarContent';

export default function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <div className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-white dark:bg-slate-950 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    L
                </div>
                <span className="font-bold text-[15px] tracking-tight">Lumina CRM</span>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Menu size={20} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    <SheetHeader className="p-4 border-b border-border/50 sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <div className="h-full" onClick={() => setOpen(false)}>
                        <SidebarContent />
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
