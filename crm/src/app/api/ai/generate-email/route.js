import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { generateEmail } from '@/lib/ai';
import db from '@/lib/db';

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { leadId, prompt } = body;

        if (!leadId) {
            return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
        }

        const result = await db.execute({
            sql: 'SELECT * FROM leads WHERE id = ? AND created_by_email = ?',
            args: [leadId, session.email]
        });

        const lead = result.rows[0];
        if (!lead) {
            return NextResponse.json({ error: 'Lead not found or access denied' }, { status: 404 });
        }

        const draftedEmail = await generateEmail(lead, prompt);

        // Optionally, save the generated draft to a draft table or action log
        // await db.execute({
        //     sql: 'INSERT INTO actions (lead_id, type, content, created_by_email) VALUES (?, ?, ?, ?)',
        //     args: [leadId, 'EmailDraft', draftedEmail, session.email]
        // });

        return NextResponse.json({ draft: draftedEmail });

    } catch (error) {
        console.error('Failed to generate AI email:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
