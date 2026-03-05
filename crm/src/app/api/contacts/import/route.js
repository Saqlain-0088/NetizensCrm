import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { contacts } = body;

        if (!Array.isArray(contacts)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const results = [];
        for (const contact of contacts) {
            const { name, company, email, phone, role } = contact;

            if (!name) continue; // Basic validation

            const info = await db.execute({
                sql: "INSERT INTO contacts (name, company, email, phone, role) VALUES (?, ?, ?, ?, ?) RETURNING id",
                args: [
                    name,
                    company || null,
                    email || null,
                    phone || null,
                    role || null
                ]
            });

            results.push(info.rows[0].id);
        }

        return NextResponse.json({ success: true, count: results.length });
    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
