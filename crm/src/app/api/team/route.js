import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';


export async function GET() {
    try {
        const session = await getSession();
        if (!session?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const result = await db.execute({
            sql: 'SELECT * FROM team WHERE created_by_email = ? ORDER BY name ASC',
            args: [session.email]
        });
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { name, email, role, phone } = body;

        const info = await db.execute({
            sql: 'INSERT INTO team (name, email, role, phone, created_by_email) VALUES (?, ?, ?, ?, ?) RETURNING id',
            args: [name, email, role, phone, session.email]
        });

        return NextResponse.json({ id: info.rows[0].id, success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
