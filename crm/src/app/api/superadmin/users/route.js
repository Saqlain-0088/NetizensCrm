import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@netizenscrm.com';
async function requireSuperAdmin() {
    const session = await getSession();
    if (!session?.email || session.email !== SUPER_ADMIN_EMAIL) return null;
    return session;
}

// GET all users across platform
export async function GET() {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const users = await db.execute(`
        SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC
    `);
    return NextResponse.json(users.rows);
}

// PATCH - suspend or update user
export async function PATCH(request) {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { userId, action } = await request.json();

    if (action === 'suspend') {
        await db.execute({ sql: "UPDATE users SET role = 'suspended' WHERE id = ?", args: [userId] });
    } else if (action === 'activate') {
        await db.execute({ sql: "UPDATE users SET role = 'user' WHERE id = ?", args: [userId] });
    }

    await db.execute({
        sql: `INSERT INTO activity_logs (actor_email, action, entity_type, entity_id)
              VALUES (?, ?, 'user', ?)`,
        args: [session.email, `User ${action}`, userId]
    });

    return NextResponse.json({ success: true });
}
