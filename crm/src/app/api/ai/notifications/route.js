import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import db from '@/lib/db';

export async function GET(request) {
    try {
        const session = await getSession();
        if (!session?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch recent leads to analyze
        const res = await db.execute({
            sql: 'SELECT * FROM leads WHERE created_by_email = ? ORDER BY created_at DESC LIMIT 50',
            args: [session.email]
        });

        const leads = res.rows;
        const notifications = [];
        const now = new Date();

        // Simple mock AI logic to generate smart notifications based on lead state
        for (const lead of leads) {
            // Check for inactive leads
            const lastContact = new Date(lead.last_contacted_at || lead.created_at);
            const daysInactive = Math.floor((now - lastContact) / (1000 * 60 * 60 * 24));

            if (daysInactive > 5 && lead.status !== 'Won' && lead.status !== 'Lost') {
                notifications.push({
                    id: `risk-${lead.id}`,
                    type: 'risk',
                    message: `High risk: "${lead.name}" hasn't been contacted in ${daysInactive} days.`,
                    time: 'Just now',
                    read: false,
                    link: `/leads/${lead.id}`
                });
            }

            // Check for high value new active deals
            if (lead.value > 15000 && lead.status === 'Negotiation') {
                notifications.push({
                    id: `opp-${lead.id}`,
                    type: 'opportunity',
                    message: `Opportunity: "${lead.company || lead.name}" is in negotiation. Great time to follow up!`,
                    time: '1h ago',
                    read: false,
                    link: `/leads/${lead.id}`
                });
            }
        }

        // Add a general system AI alert
        if (notifications.length === 0) {
            notifications.push({
                id: 'sys-1',
                type: 'info',
                message: 'Your pipeline is looking healthy. All leads have been contacted recently.',
                time: '2h ago',
                read: false,
                link: '/leads'
            });
        }

        // Sort to show unread first (though all are unread initially in this mock)
        return NextResponse.json(notifications.slice(0, 5));

    } catch (error) {
        console.error('Failed to generate AI notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
