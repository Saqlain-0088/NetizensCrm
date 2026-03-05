import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Fetch member
        const memberRes = await db.execute({
            sql: 'SELECT * FROM team WHERE id = ?',
            args: [id]
        });
        const member = memberRes.rows[0];
        if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

        // Fetch assigned leads
        const leadsRes = await db.execute({
            sql: 'SELECT * FROM leads WHERE assigned_to = ? ORDER BY created_at DESC',
            args: [member.name]
        });
        const leads = leadsRes.rows;

        // Calculate dynamic stats
        const stats = {
            totalLeads: leads.length,
            wonLeads: leads.filter(l => l.status === 'Won').length,
            activeValue: leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').reduce((sum, l) => sum + (l.value || 0), 0)
        };

        return NextResponse.json({ ...member, leads, stats });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, email, role, phone, status } = body;

        await db.execute({
            sql: `
                UPDATE team 
                SET name = COALESCE(?, name), 
                    email = COALESCE(?, email), 
                    role = COALESCE(?, role), 
                    phone = COALESCE(?, phone),
                    status = COALESCE(?, status)
                WHERE id = ?
            `,
            args: [name, email, role, phone, status, id]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        // Delete member
        await db.execute({
            sql: 'DELETE FROM team WHERE id = ?',
            args: [id]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
