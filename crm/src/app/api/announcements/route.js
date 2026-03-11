import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const result = await db.execute('SELECT * FROM announcements WHERE is_active = true ORDER BY created_at DESC LIMIT 5');
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
