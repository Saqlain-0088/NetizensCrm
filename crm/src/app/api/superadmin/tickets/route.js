import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@netizenscrm.com';
async function requireSuperAdmin() {
    const session = await getSession();
    if (!session?.email || session.email !== SUPER_ADMIN_EMAIL) return null;
    return session;
}

export async function GET() {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const result = await db.execute(`
        SELECT t.*, c.name as company_name FROM support_tickets t
        LEFT JOIN companies c ON t.company_id = c.id
        ORDER BY t.created_at DESC
    `);
    return NextResponse.json(result.rows);
}

export async function POST(request) {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { company_id, subject, message, priority } = body;

    const result = await db.execute({
        sql: `INSERT INTO support_tickets (company_id, subject, message, priority, created_by)
              VALUES (?, ?, ?, ?, ?) RETURNING *`,
        args: [company_id, subject, message, priority || 'medium', session.email]
    });

    return NextResponse.json(result.rows[0]);
}

export async function PATCH(request) {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { ticketId, status, assigned_to } = await request.json();
    await db.execute({
        sql: 'UPDATE support_tickets SET status = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        args: [status, assigned_to, ticketId]
    });
    return NextResponse.json({ success: true });
}
