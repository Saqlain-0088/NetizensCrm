import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { generateForecast } from '@/lib/ai';
import db from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getSession();
        if (!session?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await db.execute({
            sql: 'SELECT * FROM leads WHERE created_by_email = ? AND status != ?',
            args: [session.email, 'Lost']
        });

        const activeLeads = result.rows;

        // Generate the forecast using AI logic based on pipeline data
        const forecast = await generateForecast(activeLeads);

        return NextResponse.json(forecast);

    } catch (error) {
        console.error('Failed to generate AI forecast:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
