import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const result = await db.execute({
            sql: 'SELECT * FROM contacts WHERE id = ?',
            args: [id]
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, email, phone, company, role } = body;

        await db.execute({
            sql: `UPDATE contacts SET name = ?, email = ?, phone = ?, company = ?, role = ? WHERE id = ?`,
            args: [name, email, phone, company, role, id]
        });

        return NextResponse.json({ message: 'Contact updated successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await db.execute({
            sql: 'DELETE FROM contacts WHERE id = ?',
            args: [id]
        });

        return NextResponse.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
