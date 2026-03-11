import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getPlanLimits } from '@/lib/plans';
import db from '@/lib/db';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ user: null }, { status: 200 });
    }

    const plan = session.plan || 'free';
    const limits = getPlanLimits(plan);

    // Get usage counts - filtered by user
    let leadsCount = 0, contactsCount = 0;
    try {
        const [leadsRes, contactsRes] = await Promise.all([
            db.execute({
                sql: 'SELECT COUNT(*) as c FROM leads WHERE created_by_email = ?',
                args: [session.email]
            }),
            db.execute({
                sql: 'SELECT COUNT(*) as c FROM contacts WHERE created_by_email = ?',
                args: [session.email]
            })
        ]);
        leadsCount = parseInt(leadsRes.rows?.[0]?.c ?? '0', 10);
        contactsCount = parseInt(contactsRes.rows?.[0]?.c ?? '0', 10);
    } catch (_) { }

    return NextResponse.json({
        user: {
            id: session.id,
            name: session.name,
            email: session.email,
            role: session.role,
            plan
        },
        usage: {
            leads: { used: leadsCount, limit: limits.leads < 0 ? null : limits.leads },
            contacts: { used: contactsCount, limit: limits.contacts < 0 ? null : limits.contacts }
        }
    });
}
