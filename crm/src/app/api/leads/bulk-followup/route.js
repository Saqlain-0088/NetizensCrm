import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/session';
import { generateEmail } from '@/lib/ai';

export async function POST(request) {
    try {
        const session = await getSession();
        if (!session?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { leadIds, drafts } = body; // drafts: { [leadId]: emailText } — optional

        if (!Array.isArray(leadIds) || leadIds.length === 0) {
            return NextResponse.json({ error: 'leadIds array is required' }, { status: 400 });
        }

        const placeholders = leadIds.map(() => '?').join(',');

        const result = await db.execute({
            sql: `SELECT * FROM leads WHERE id IN (${placeholders}) AND created_by_email = ?`,
            args: [...leadIds, session.email]
        });

        const targetLeads = result.rows;
        let successCount = 0;

        for (const lead of targetLeads) {
            // Use user-supplied draft if provided, otherwise generate from AI
            let emailContent = drafts?.[lead.id];
            if (!emailContent) {
                emailContent = await generateEmail(lead, `Smart follow-up based on lead status: ${lead.status}`);
            }

            // Update last_contacted_at
            await db.execute({
                sql: 'UPDATE leads SET last_contacted_at = CURRENT_TIMESTAMP WHERE id = ?',
                args: [lead.id]
            });

            // Log the follow-up email as an action in the lead timeline
            const actionContent = `**📧 AI Bulk Follow-Up Sent:**\n\n${emailContent}`;
            await db.execute({
                sql: 'INSERT INTO actions (lead_id, type, content) VALUES (?, ?, ?)',
                args: [lead.id, 'Email', actionContent]
            });

            successCount++;
        }

        return NextResponse.json({ success: true, count: successCount });

    } catch (error) {
        console.error('Bulk Follow-up Error:', error);
        return NextResponse.json({ error: 'Failed to process bulk follow-up' }, { status: 500 });
    }
}
