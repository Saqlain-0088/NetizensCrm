import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const result = await db.execute('SELECT * FROM team ORDER BY name ASC');
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, role, phone } = body;

        const info = await db.execute({
            sql: 'INSERT INTO team (name, email, role, phone) VALUES (?, ?, ?, ?) RETURNING id',
            args: [name, email, role, phone]
        });

        return NextResponse.json({ id: info.rows[0].id, success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
