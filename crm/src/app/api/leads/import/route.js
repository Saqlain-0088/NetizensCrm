import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request) {
    try {
        const body = await request.json();
        const { leads } = body;

        if (!Array.isArray(leads)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        // Get active team members for auto-assignment
        const teamResult = await db.execute("SELECT name FROM team WHERE status = 'Active'");
        const teamRows = teamResult.rows;

        const results = [];
        for (const lead of leads) {
            const { name, company, email, phone, value, source, priority } = lead;

            if (!name) continue; // Basic validation

            let assignedTo = 'Unassigned';
            if (teamRows.length > 0) {
                assignedTo = teamRows[Math.floor(Math.random() * teamRows.length)].name;
            }

            const session = await getSession();
            if (!session?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

            const info = await db.execute({
                sql: "INSERT INTO leads (name, company, email, phone, value, source, status, priority, assigned_to, created_by_email) VALUES (?, ?, ?, ?, ?, ?, 'New', ?, ?, ?) RETURNING id",
                args: [
                    name,
                    company || null,
                    email || null,
                    phone || null,
                    value ? parseInt(value) : 0,
                    source || 'Import',
                    priority || 'Medium',
                    assignedTo,
                    session.email
                ]
            });

            const leadId = info.rows[0].id;

            // Create initial action log
            await db.execute({
                sql: 'INSERT INTO actions (lead_id, type, content) VALUES (?, ?, ?)',
                args: [leadId, 'System', `Lead imported. Auto-assigned to ${assignedTo}.`]
            });

            results.push(leadId);
        }

        return NextResponse.json({ success: true, count: results.length });
    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
