'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Mail, Phone, Building, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ImportDataDialog } from '@/components/ImportDataDialog';
import PageHeader from '@/components/PageHeader';

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchContacts();
    }, [search]);

    const fetchContacts = async () => {
        try {
            const query = search ? `?search=${encodeURIComponent(search)}` : '';
            const res = await fetch(`/api/contacts${query}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setContacts(data);
            }
        } catch (error) {
            console.error('Failed to fetch contacts', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20">
            {/* Toolbar */}
            <PageHeader
                title="Contacts"
                subtitle="Customer Database"
                searchPlaceholder="Search contacts..."
                searchValue={search}
                onSearchChange={setSearch}
            >
                <div className="flex items-center gap-2">
                    <ImportDataDialog type="Contact" apiUrl="/api/contacts/import" onImportSuccess={fetchContacts} />
                    <Button asChild size="sm" className="h-9 px-4 text-[11px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white flex items-center rounded-lg shadow-md transition-all active:scale-95">
                        <Link href="/contacts/new">
                            <Plus size={14} className="mr-1.5" /> <span className="hidden sm:inline">New Contact</span>
                        </Link>
                    </Button>
                </div>
            </PageHeader>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 md:p-8 custom-scrollbar">
                <div className="bg-white dark:bg-slate-950 rounded-lg border border-border/50 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                            <TableRow>
                                <TableHead className="w-[300px] font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Name / Role</TableHead>
                                <TableHead className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Company</TableHead>
                                <TableHead className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Contact Info</TableHead>
                                <TableHead className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Loading contacts...</TableCell>
                                </TableRow>
                            ) : contacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                        No contacts found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contacts.map(contact => (
                                    <TableRow key={contact.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 border border-border/50">
                                                    {contact.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{contact.name}</div>
                                                    <div className="text-xs text-muted-foreground">{contact.role || 'No Role'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building size={14} className="text-muted-foreground" />
                                                <span className="text-sm font-medium">{contact.company || '—'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {contact.email && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-indigo-600 transition-colors">
                                                        <Mail size={12} /> {contact.email}
                                                    </div>
                                                )}
                                                {contact.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Phone size={12} /> {contact.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/contacts/${contact.id}`}>View</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
