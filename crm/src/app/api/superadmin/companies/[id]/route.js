import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@netizenscrm.com';
async function requireSuperAdmin() {
    const session = await getSession();
    if (!session?.email || session.email !== SUPER_ADMIN_EMAIL) return null;
    return session;
}

// PATCH update company (status, plan, extend trial)
export async function PATCH(request, { params }) {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { status, plan_id, extend_trial_days } = body;

    const updates = [];
    const args = [];

    if (status) { updates.push('status = ?'); args.push(status); }
    if (plan_id) { updates.push('plan_id = ?'); args.push(plan_id); }
    if (extend_trial_days) {
        updates.push("trial_ends_at = CURRENT_TIMESTAMP + INTERVAL '? days'");
        args.push(extend_trial_days);
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    args.push(id);

    if (updates.length > 1) {
        await db.execute({
            sql: `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`,
            args
        });
    }

    // Log the action
    await db.execute({
        sql: `INSERT INTO activity_logs (actor_email, action, entity_type, entity_id, details)
              VALUES (?, ?, 'company', ?, ?)`,
        args: [session.email, `Company updated: ${JSON.stringify(body)}`, id, JSON.stringify(body)]
    });

    return NextResponse.json({ success: true });
}

// DELETE company
export async function DELETE(request, { params }) {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    await db.execute({ sql: 'DELETE FROM companies WHERE id = ?', args: [id] });

    await db.execute({
        sql: `INSERT INTO activity_logs (actor_email, action, entity_type, entity_id)
              VALUES (?, 'Company deleted', 'company', ?)`,
        args: [session.email, id]
    });

    return NextResponse.json({ success: true });
}
