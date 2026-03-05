import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { type, content, parent_action_id } = body;

        const result = await db.execute({
            sql: `
                INSERT INTO actions (lead_id, parent_action_id, type, content)
                VALUES (?, ?, ?, ?) RETURNING id
            `,
            args: [id, parent_action_id || null, type, content]
        });

        return NextResponse.json({ id: Number(result.rows[0].id), success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
