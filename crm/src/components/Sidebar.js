'use client';

import SidebarContent from './SidebarContent';

export default function Sidebar() {
    return (
        <aside className="hidden lg:flex w-64 h-full border-r border-border bg-white flex-col z-50">
            <SidebarContent />
        </aside>
    );
}
