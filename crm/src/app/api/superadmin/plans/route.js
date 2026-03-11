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

    const plans = await db.execute(`
        SELECT p.*, af.lead_scoring, af.email_generator, af.chat_assistant, af.forecasting, af.meeting_notes, af.smart_notifications
        FROM plans p
        LEFT JOIN ai_feature_flags af ON af.plan_id = p.id
        ORDER BY p.monthly_price ASC
    `);
    return NextResponse.json(plans.rows);
}

export async function POST(request) {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { name, monthly_price, yearly_price, max_users, max_leads, max_contacts, storage_gb, ai_features, api_access, support_type, features } = body;

    const result = await db.execute({
        sql: `INSERT INTO plans (name, monthly_price, yearly_price, max_users, max_leads, max_contacts, storage_gb, ai_features, api_access, support_type, features)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              RETURNING *`,
        args: [name, monthly_price, yearly_price, max_users, max_leads, max_contacts, storage_gb, ai_features, api_access, support_type, JSON.stringify(features || [])]
    });

    const planId = result.rows[0].id;
    await db.execute({
        sql: `INSERT INTO ai_feature_flags (plan_id) VALUES (?) ON CONFLICT (plan_id) DO NOTHING`,
        args: [planId]
    });

    return NextResponse.json(result.rows[0]);
}

export async function PATCH(request) {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { id, lead_scoring, email_generator, chat_assistant, forecasting, meeting_notes, smart_notifications, ...planFields } = body;

    // Update plan fields
    if (Object.keys(planFields).length > 0) {
        const updates = Object.keys(planFields).map(k => `${k} = ?`).join(', ');
        const values = [...Object.values(planFields), id];
        await db.execute({ sql: `UPDATE plans SET ${updates} WHERE id = ?`, args: values });
    }

    // Update AI flags
    await db.execute({
        sql: `UPDATE ai_feature_flags SET lead_scoring=?, email_generator=?, chat_assistant=?, forecasting=?, meeting_notes=?, smart_notifications=?, updated_at=CURRENT_TIMESTAMP
              WHERE plan_id = ?`,
        args: [lead_scoring || false, email_generator || false, chat_assistant || false, forecasting || false, meeting_notes || false, smart_notifications || false, id]
    });

    return NextResponse.json({ success: true });
}
