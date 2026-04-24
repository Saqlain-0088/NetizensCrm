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

    // Bypass usage and company DB queries for superadmins
    const isSuperAdmin = session.role === 'superadmin' || session.role === 'super_admin' || session.email === 'superadmin@netizenscrm.com';
    if (isSuperAdmin) {
        return NextResponse.json({
            user: {
                id: session.id,
                name: session.name,
                email: session.email,
                role: session.role,
                plan: plan
            },
            usage: {
                leads: { used: 0, limit: null },
                contacts: { used: 0, limit: null }
            },
            company: null
        });
    }

    // Get usage counts and company info (for normal users)
    let leadsCount = 0, contactsCount = 0, companyInfo = null;
    try {
        // Run queries individually so one failure doesn't block the whole response
        const leadsRes = await db.execute({
            sql: 'SELECT COUNT(*) as c FROM leads WHERE created_by_email = ?',
            args: [session.email]
        }).catch(() => ({ rows: [{ c: 0 }] }));

        const contactsRes = await db.execute({
            sql: 'SELECT COUNT(*) as c FROM contacts WHERE created_by_email = ?',
            args: [session.email]
        }).catch(() => ({ rows: [{ c: 0 }] }));

        const companyRes = await db.execute({
            sql: 'SELECT * FROM companies WHERE id = ?',
            args: [session.companyId || 0]
        }).catch(() => ({ rows: [] }));

        const planRes = await db.execute({
            sql: `SELECT p.name as plan_name, p.is_ai_enabled, af.* 
                  FROM plans p 
                  LEFT JOIN ai_feature_flags af ON af.plan_id = p.id 
                  WHERE p.name = $1 OR p.id::text = $2
                  LIMIT 1`,
            args: [plan, String(plan)]
        }).catch(() => ({ rows: [] }));
        leadsCount = parseInt(leadsRes.rows?.[0]?.c ?? '0', 10);
        contactsCount = parseInt(contactsRes.rows?.[0]?.c ?? '0', 10);
        companyInfo = companyRes.rows?.[0] || null;
        const planData = planRes.rows?.[0] || null;

        let dynamicLimits = { ...limits };
        if (planData) {
            dynamicLimits = {
                leads: planData.max_leads === 0 ? -1 : planData.max_leads,
                contacts: planData.max_contacts === 0 ? -1 : planData.max_contacts,
                users: planData.max_users === 0 ? -1 : planData.max_users,
            };

            companyInfo = companyInfo || {};
            companyInfo.ai_flags = planData;

            // Respect the master AI toggle
            if (!planData.is_ai_enabled) {
                Object.keys(planData).forEach(key => {
                    if (typeof planData[key] === 'boolean') planData[key] = false;
                });
            }
        }

        return NextResponse.json({
            user: {
                id: session.id,
                name: session.name,
                email: session.email,
                role: session.role,
                plan: planData?.plan_name || plan
            },
            usage: {
                leads: { used: leadsCount, limit: dynamicLimits.leads < 0 ? null : dynamicLimits.leads },
                contacts: { used: contactsCount, limit: dynamicLimits.contacts < 0 ? null : dynamicLimits.contacts }
            },
            company: companyInfo
        });
    } catch (err) {
        console.error('Me API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
