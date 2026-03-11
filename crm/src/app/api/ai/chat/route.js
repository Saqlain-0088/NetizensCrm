import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { chatAssistant } from '@/lib/ai';
import db from '@/lib/db';

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Fetch recent active leads to provide context to the AI
        const result = await db.execute({
            sql: 'SELECT id, name, company, status, value, priority, last_contacted_at, created_at FROM leads WHERE created_by_email = ? AND status != ? ORDER BY updated_at DESC LIMIT 20',
            args: [session.email, 'Lost']
        });

        const contextLeads = result.rows;

        // Call AI engine
        const reply = await chatAssistant(message, contextLeads);

        return NextResponse.json({ reply });

    } catch (error) {
        console.error('Failed to process AI chat message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
