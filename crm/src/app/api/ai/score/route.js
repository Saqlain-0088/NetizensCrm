import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { scoreLead } from '@/lib/ai';
import db from '@/lib/db';

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { leadId } = body;

        if (!leadId) {
            return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
        }

        // Fetch lead data to score
        const result = await db.execute({
            sql: 'SELECT * FROM leads WHERE id = ? AND created_by_email = ?',
            args: [leadId, session.email]
        });

        const lead = result.rows[0];
        if (!lead) {
            return NextResponse.json({ error: 'Lead not found or access denied' }, { status: 404 });
        }

        // Call the AI service to score the lead
        const scoreData = await scoreLead(lead);

        // Optionally, you could save this score back to the database here
        // await db.execute({
        //     sql: 'UPDATE leads SET ai_score = ?, ai_risk = ? WHERE id = ?',
        //     args: [scoreData.score, scoreData.riskLevel, leadId]
        // });

        return NextResponse.json(scoreData);

    } catch (error) {
        console.error('AI Scoring Error:', error);
        return NextResponse.json({ error: 'Failed to generate AI score' }, { status: 500 });
    }
}
