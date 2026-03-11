import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@netizenscrm.com';
async function requireSuperAdmin() {
    const session = await getSession();
    if (!session?.email || session.email !== SUPER_ADMIN_EMAIL) return null;
    return session;
}

// GET all companies
export async function GET() {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const result = await db.execute(`
        SELECT c.*, p.name as plan_name, p.monthly_price
        FROM companies c
        LEFT JOIN plans p ON c.plan_id = p.id
        ORDER BY c.created_at DESC
    `);
    return NextResponse.json(result.rows);
}

// POST create company
export async function POST(request) {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { name, admin_email, admin_name, phone, plan_id, status } = body;

    const result = await db.execute({
        sql: `INSERT INTO companies (name, admin_email, admin_name, phone, plan_id, status, trial_ends_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              RETURNING *`,
        args: [name, admin_email, admin_name, phone, plan_id || null, status || 'trial',
            status === 'trial' ? new Date(Date.now() + 14 * 86400000).toISOString() : null]
    });

    return NextResponse.json(result.rows[0]);
}
