'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building, User, Mail, Phone, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewContactPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                router.push('/contacts');
                router.refresh();
            } else {
                console.error('Failed to create contact');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20 p-4 md:p-8 overflow-auto custom-scrollbar">
            <div className="max-w-2xl mx-auto w-full">
                <div className="mb-6 flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/contacts" prefetch={false}>
                            <ArrowLeft size={18} />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-bold tracking-tight">Add New Contact</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
                                        <Input id="name" name="name" placeholder="e.g. Jane Doe" className="pl-9" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Job Title</Label>
                                    <div className="relative">
                                        <Briefcase size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
                                        <Input id="role" name="role" placeholder="e.g. Marketing Manager" className="pl-9" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <div className="relative">
                                    <Building size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
                                    <Input id="company" name="company" placeholder="e.g. Acme Corp" className="pl-9" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
                                        <Input id="email" name="email" type="email" placeholder="jane@example.com" className="pl-9" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
                                        <Input id="phone" name="phone" placeholder="+1 (555) 000-0000" className="pl-9" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="button" variant="ghost" className="mr-2" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                                    {loading ? 'Saving...' : 'Create Contact'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
