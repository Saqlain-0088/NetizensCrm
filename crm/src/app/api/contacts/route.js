import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        let query = 'SELECT * FROM contacts ORDER BY created_at DESC';
        let args = [];

        if (search) {
            query = 'SELECT * FROM contacts WHERE name LIKE ? OR company LIKE ? OR email LIKE ? ORDER BY created_at DESC';
            const term = `%${search}%`;
            args = [term, term, term];
        }

        const result = await db.execute({ sql: query, args });
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, phone, company, role } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const result = await db.execute({
            sql: `INSERT INTO contacts (name, email, phone, company, role) VALUES (?, ?, ?, ?, ?) RETURNING id`,
            args: [name, email, phone, company, role]
        });

        return NextResponse.json({
            id: result.rows[0].id,
            message: 'Contact created successfully'
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
