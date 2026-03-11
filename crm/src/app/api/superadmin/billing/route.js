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

    const payments = await db.execute(`
        SELECT p.*, c.name as company_name, pl.name as plan_name
        FROM payments p
        LEFT JOIN companies c ON p.company_id = c.id
        LEFT JOIN plans pl ON p.plan_id = pl.id
        ORDER BY p.created_at DESC
    `);
    return NextResponse.json(payments.rows);
}

export async function POST(request) {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { company_id, amount, status, plan_id, payment_method, transaction_id } = body;

    const invoiceNum = `INV-${Date.now()}`;
    const result = await db.execute({
        sql: `INSERT INTO payments (company_id, amount, status, plan_id, payment_method, transaction_id, invoice_number)
              VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
        args: [company_id, amount, status || 'success', plan_id, payment_method, transaction_id, invoiceNum]
    });

    return NextResponse.json(result.rows[0]);
}
