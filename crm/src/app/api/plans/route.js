import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const plans = await db.execute(`
            SELECT p.*, af.lead_scoring, af.email_generator, af.chat_assistant, af.forecasting, af.meeting_notes, af.smart_notifications
            FROM plans p
            LEFT JOIN ai_feature_flags af ON af.plan_id = p.id
            ORDER BY p.monthly_price ASC
        `);
        return NextResponse.json(plans.rows);
    } catch (error) {
        console.error('Error fetching plans:', error);
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}
