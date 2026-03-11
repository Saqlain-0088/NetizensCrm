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

    const result = await db.execute('SELECT * FROM announcements ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
}

export async function POST(request) {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { title, message, type } = await request.json();
    const result = await db.execute({
        sql: 'INSERT INTO announcements (title, message, type, created_by) VALUES (?, ?, ?, ?) RETURNING *',
        args: [title, message, type || 'info', session.email]
    });

    return NextResponse.json(result.rows[0]);
}

export async function PATCH(request) {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id, is_active } = await request.json();
    await db.execute({ sql: 'UPDATE announcements SET is_active = ? WHERE id = ?', args: [is_active, id] });
    return NextResponse.json({ success: true });
}
