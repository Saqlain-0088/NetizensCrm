import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export async function POST() {
    try {
        // 1. Get all unassigned leads
        const unassignedRes = await db.execute('SELECT * FROM leads WHERE assigned_to IS NULL OR assigned_to = ""');
        const unassignedLeads = unassignedRes.rows;

        if (unassignedLeads.length === 0) {
            return NextResponse.json({ message: 'No unassigned leads found', count: 0 });
        }

        // 2. Get all active team members
        const teamRes = await db.execute("SELECT * FROM team WHERE status = 'Active'");
        const team = teamRes.rows;

        if (team.length === 0) {
            return NextResponse.json({ error: 'No active team members available for assignment' }, { status: 400 });
        }

        const assignments = [];

        for (let i = 0; i < unassignedLeads.length; i++) {
            const lead = unassignedLeads[i];
            const targetMember = team[i % team.length];

            // Persist assignment
            await db.execute({
                sql: 'UPDATE leads SET assigned_to = ? WHERE id = ?',
                args: [targetMember.name, lead.id]
            });

            // Log in CRM timeline
            await db.execute({
                sql: 'INSERT INTO actions (lead_id, type, content) VALUES (?, ?, ?)',
                args: [lead.id, 'AutoAssign', `System auto-assigned to ${targetMember.name} and triggered WhatsApp notification.`]
            });

            // DISPATCH WHATSAPP NOTIFICATION
            await sendWhatsAppNotification(targetMember, lead);

            assignments.push({
                leadId: lead.id,
                leadName: lead.name,
                assignedTo: targetMember.name,
                notification: 'Sent'
            });
        }

        return NextResponse.json({
            success: true,
            message: `Assigned ${assignments.length} leads with WhatsApp notifications triggered.`,
            count: assignments.length
        });
    } catch (error) {
        console.error('Auto-Assign Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
