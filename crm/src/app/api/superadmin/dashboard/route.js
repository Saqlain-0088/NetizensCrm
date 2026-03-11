import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@netizenscrm.com';

async function requireSuperAdmin() {
    const session = await getSession();
    if (!session?.email || session.email !== SUPER_ADMIN_EMAIL) {
        return null;
    }
    return session;
}

export async function GET() {
    const session = await requireSuperAdmin();
    if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [companies, users, payments, plans] = await Promise.all([
        db.execute('SELECT * FROM companies'),
        db.execute('SELECT id, email, role, created_at FROM users'),
        db.execute("SELECT * FROM payments WHERE status = 'success'"),
        db.execute('SELECT * FROM plans WHERE is_active = true'),
    ]);

    const totalCompanies = companies.rows.length;
    const activeSubscriptions = companies.rows.filter(c => c.status === 'active').length;
    const trialAccounts = companies.rows.filter(c => c.status === 'trial').length;
    const expiredAccounts = companies.rows.filter(c => c.status === 'expired').length;
    const totalUsers = users.rows.length;
    const monthlyRevenue = payments.rows.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    const leadsResult = await db.execute('SELECT COUNT(*) as count FROM leads');
    const recentActivity = await db.execute(
        'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10'
    );

    return NextResponse.json({
        stats: {
            totalCompanies,
            activeSubscriptions,
            trialAccounts,
            expiredAccounts,
            totalUsers,
            monthlyRevenue,
            totalDeals: parseInt(leadsResult.rows[0]?.count || 0),
        },
        recentActivity: recentActivity.rows,
        companies: companies.rows,
        plans: plans.rows,
    });
}
