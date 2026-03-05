'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus, Search, Filter, LayoutList, LayoutGrid,
    MoreHorizontal, Calendar, ArrowUpRight,
    Tag, Download, SlidersHorizontal, ChevronRight
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { ImportDataDialog } from '@/components/ImportDataDialog';

const COLUMNS = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost'];

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('board');
    const [search, setSearch] = useState('');
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setHydrated(true);
        fetchLeads();
    }, []);

    const fetchLeads = () => {
        fetch('/api/leads')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLeads(data);
                } else {
                    console.error('API returned non-array:', data);
                    setLeads([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLeads([]);
                setLoading(false);
            });
    };

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const leadId = parseInt(draggableId);
        const newStatus = destination.droppableId;
        const oldStatus = source.droppableId;

        // Optimistic UI Update
        const updatedLeads = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
        setLeads(updatedLeads);

        if (newStatus === 'Won' && oldStatus !== 'Won') {
            triggerWonCelebration();
        }

        try {
            await fetch(`/api/leads/${leadId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (error) {
            console.error(error);
            fetchLeads(); // Revert on failure
        }
    };

    const triggerWonCelebration = () => {
        const end = Date.now() + 2 * 1000;
        const colors = ['#4f46e5', '#10b981', '#f59e0b'];
        (function frame() {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors
            });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    };

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        (l.company && l.company.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading || !hydrated) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20">
            {/* Top Toolbar */}
            <div className="min-h-16 h-auto py-4 px-4 md:px-8 border-b border-border bg-white dark:bg-slate-950 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-40 gap-4">
                <div className="flex items-center justify-between md:justify-start gap-4 md:gap-6">
                    <h1 className="text-lg font-bold">Pipeline</h1>

                    <div className="h-9 flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-border/50">
                        <Button
                            variant={viewMode === 'list' ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="h-full px-3 text-xs font-bold"
                        >
                            <LayoutList size={14} className="mr-2" /> List
                        </Button>
                        <Button
                            variant={viewMode === 'board' ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode('board')}
                            className="h-full px-3 text-xs font-bold"
                        >
                            <LayoutGrid size={14} className="mr-2" /> Board
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Find deals..."
                            className="w-full h-9 pl-9 text-xs focus-visible:ring-indigo-600"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <ImportDataDialog type="Lead" apiUrl="/api/leads/import" onImportSuccess={fetchLeads} />
                    <Button asChild size="sm" className="h-9 px-3 text-xs bg-indigo-600 hover:bg-indigo-700">
                        <Link href="/leads/new">
                            <Plus size={14} className="mr-1" /> New Deal
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {viewMode === 'list' ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card bg-white dark:bg-slate-950 overflow-hidden border border-border/50 shadow-sm"
                        >
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                                        <TableRow>
                                            <TableHead className="px-6 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Company / Contact</TableHead>
                                            <TableHead className="px-6 font-bold text-muted-foreground uppercase tracking-widest text-[10px]">Stage</TableHead>
                                            <TableHead className="px-6 font-bold text-muted-foreground uppercase tracking-widest text-[10px] hidden sm:table-cell">Priority</TableHead>
                                            <TableHead className="px-6 font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right">Deal Value</TableHead>
                                            <TableHead className="px-6 font-bold text-muted-foreground uppercase tracking-widest text-[10px] text-right hidden md:table-cell">Last Touch</TableHead>
                                            <TableHead className="w-16"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLeads.map(lead => (
                                            <TableRow key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors group">
                                                <TableCell className="px-6 py-4">
                                                    <Link href={`/leads/${lead.id}`} className="block">
                                                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">
                                                            {lead.company || '—'}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground mt-0.5">{lead.name}</div>
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="px-6 py-4">
                                                    <Badge variant="outline" className="font-bold text-[10px] border-slate-200 dark:border-slate-800">
                                                        {lead.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="px-6 py-4 hidden sm:table-cell">
                                                    <PriorityBadge priority={lead.priority} />
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-right font-black text-slate-900 dark:text-slate-100">
                                                    ${lead.value?.toLocaleString() || 0}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-right text-muted-foreground font-medium hidden md:table-cell">
                                                    {lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : 'Never'}
                                                </TableCell>
                                                <TableCell className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600">
                                                        <MoreHorizontal size={16} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="board"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full"
                        >
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <div className="flex gap-4 md:gap-6 h-full items-start overflow-x-auto pb-4">
                                    {COLUMNS.map(column => {
                                        const columnLeads = filteredLeads.filter(l => l.status === column);
                                        return (
                                            <Droppable key={column} droppableId={column}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                        className={`w-72 shrink-0 flex flex-col max-h-full rounded-xl transition-all ${snapshot.isDraggingOver ? "bg-indigo-50/50 dark:bg-indigo-900/10" : "bg-slate-100/40 dark:bg-slate-900/40"}`}
                                                    >
                                                        <div className="p-4 flex items-center justify-between sticky top-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-[13px] text-slate-900 dark:text-slate-100 tracking-tight">{column}</span>
                                                                <Badge variant="secondary" className="px-1.5 py-0 rounded-md text-[10px] font-black h-5">
                                                                    {columnLeads.length}
                                                                </Badge>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-indigo-600">
                                                                <Plus size={14} />
                                                            </Button>
                                                        </div>

                                                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-[150px]">
                                                            {columnLeads.map((lead, index) => (
                                                                <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={`group relative border border-border/50 bg-white dark:bg-slate-950 p-4 rounded-lg hover:border-indigo-500/40 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${snapshot.isDragging ? "shadow-2xl ring-2 ring-indigo-600 z-50 rotate-3 scale-105" : ""}`}
                                                                        >
                                                                            <div className="flex justify-between items-start mb-2.5">
                                                                                <div className="font-black text-[13px] text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600">
                                                                                    {lead.company || lead.name}
                                                                                </div>
                                                                                <PriorityBadge priority={lead.priority} dotOnly />
                                                                            </div>

                                                                            <div className="flex items-center gap-1.5 mb-4">
                                                                                <Tag size={10} className="text-muted-foreground" />
                                                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">
                                                                                    {lead.source} Project
                                                                                </span>
                                                                            </div>

                                                                            <div className="flex items-center justify-between pt-3 border-t border-border/30">
                                                                                <div className="text-[12px] font-black tracking-tight">
                                                                                    ${lead.value?.toLocaleString()}
                                                                                </div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-muted-foreground overflow-hidden border border-border">
                                                                                        {lead.assigned_to ? lead.assigned_to[0] : '?'}
                                                                                    </div>
                                                                                    <Link href={`/leads/${lead.id}`} className="text-muted-foreground hover:text-indigo-600">
                                                                                        <ChevronRight size={14} />
                                                                                    </Link>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    </div>
                                                )}
                                            </Droppable>
                                        );
                                    })}
                                </div>
                            </DragDropContext>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function PriorityBadge({ priority, dotOnly = false }) {
    const colors = {
        Urgent: "bg-red-500 text-red-600 border-red-200",
        High: "bg-amber-500 text-amber-600 border-amber-200",
        Medium: "bg-indigo-500 text-indigo-600 border-indigo-200",
        Low: "bg-slate-400 text-slate-500 border-slate-200",
    };

    if (dotOnly) return <div className={`w-2 h-2 rounded-full ${colors[priority]?.split(' ')[0]}`} />;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 ${colors[priority]?.split(' ').slice(1).join(' ')}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${colors[priority]?.split(' ')[0]}`}></div>
            {priority}
        </div>
    );
}
