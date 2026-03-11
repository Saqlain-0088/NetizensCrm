import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAddContact } from '@/lib/plans';

export async function GET(request) {
    try {
        const session = await getSession();
        if (!session?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        let query = 'SELECT * FROM contacts WHERE created_by_email = ? ORDER BY created_at DESC';
        let args = [session.email];

        if (search) {
            query = 'SELECT * FROM contacts WHERE (name LIKE ? OR company LIKE ? OR email LIKE ?) AND created_by_email = ? ORDER BY created_at DESC';
            const term = `%${search}%`;
            args = [term, term, term, session.email];
        }

        const result = await db.execute({ sql: query, args });
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession();
        const plan = session?.plan || 'free';

        if (plan === 'free') {
            const countResult = await db.execute('SELECT COUNT(*) as c FROM contacts');
            const count = parseInt(countResult.rows?.[0]?.c ?? '0', 10);
            if (!canAddContact(plan, count)) {
                return NextResponse.json({
                    error: "You've reached your contact limit (100). Upgrade to Pro to add unlimited contacts.",
                    code: 'CONTACT_LIMIT_REACHED'
                }, { status: 403 });
            }
        }

        const body = await request.json();
        const { name, email, phone, company, role } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const result = await db.execute({
            sql: `INSERT INTO contacts (name, email, phone, company, role, created_by_email) VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
            args: [name, email, phone, company, role, session.email]
        });

        return NextResponse.json({
            id: result.rows[0].id,
            message: 'Contact created successfully'
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
