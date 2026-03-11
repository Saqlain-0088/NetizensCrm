import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendWhatsAppNotification } from '@/lib/whatsapp';
import { getSession } from '@/lib/session';
import { canAddLead } from '@/lib/plans';

// Helper to add CORS headers
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
    console.log('GET /api/leads - Fetching filtered leads from Supabase');
    try {
        const session = await getSession();
        if (!session?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
        }

        const result = await db.execute({
            sql: 'SELECT * FROM leads WHERE created_by_email = ? ORDER BY created_at DESC',
            args: [session.email]
        });
        console.log(`GET /api/leads - Successfully fetched ${result.rows.length} leads for ${session.email}`);
        return NextResponse.json(result.rows, { headers: corsHeaders() });
    } catch (error) {
        console.error('GET /api/leads - Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders() });
    }
}

export async function POST(request) {
    try {
        const session = await getSession();
        const plan = session?.plan || 'free';

        // Freemium limit check
        if (plan === 'free') {
            const countResult = await db.execute('SELECT COUNT(*) as c FROM leads');
            const count = parseInt(countResult.rows?.[0]?.c ?? '0', 10);
            if (!canAddLead(plan, count)) {
                return NextResponse.json({
                    error: "You've reached your lead limit (50). Upgrade to Pro to add unlimited leads.",
                    code: 'LEAD_LIMIT_REACHED'
                }, { status: 403, headers: corsHeaders() });
            }
        }

        const body = await request.json();
        const { name, company, email, phone, source = 'Manual', priority = 'Medium' } = body;

        // --- Auto Assignment Logic (Simple Round Robin / Random for demo) ---
        // In a real app, you'd fetch active team members from the DB.
        const teamResult = await db.execute("SELECT * FROM team WHERE status = 'Active'");
        const teamRows = teamResult.rows;

        let assignedTo = 'Unassigned';
        let assignedMember = null;
        if (teamRows.length > 0) {
            assignedMember = teamRows[Math.floor(Math.random() * teamRows.length)];
            assignedTo = assignedMember.name;
        }

        const info = await db.execute({
            sql: "INSERT INTO leads (name, company, email, phone, source, status, priority, assigned_to, created_by_email) VALUES (?, ?, ?, ?, ?, 'New', ?, ?, ?) RETURNING id",
            args: [name, company, email, phone, source, priority, assignedTo, session.email]
        });

        const leadId = info.rows[0].id;

        // Create initial action log
        await db.execute({
            sql: 'INSERT INTO actions (lead_id, type, content) VALUES (?, ?, ?)',
            args: [leadId, 'System', `Lead created via ${source}. Auto-assigned to ${assignedTo}.`]
        });

        // TRIGGER WHATSAPP ON AUTO-ASSIGNMENT
        if (assignedMember) {
            const leadRes = await db.execute({
                sql: 'SELECT * FROM leads WHERE id = ?',
                args: [leadId]
            });
            const lead = leadRes.rows[0];

            if (lead) {
                await sendWhatsAppNotification(assignedMember, lead, 'new_lead');

                await db.execute({
                    sql: 'INSERT INTO actions (lead_id, type, content) VALUES (?, ?, ?)',
                    args: [leadId, 'System', `WhatsApp notification dispatched to ${assignedTo}.`]
                });
            }
        }

        return NextResponse.json(
            { id: leadId, assignedTo, message: 'Lead created successfully' },
            { headers: corsHeaders() }
        );
    } catch (error) {
        console.error('Lead construction error:', error);
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders() });
    }
}
