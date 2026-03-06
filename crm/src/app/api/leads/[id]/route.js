import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { sendWhatsAppNotification } from '@/lib/whatsapp';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const result = await db.execute({
            sql: 'SELECT * FROM leads WHERE id = ?',
            args: [id]
        });
        const lead = result.rows[0];
        if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

        // Fetch actions (follow-ups)
        const actionsResult = await db.execute({
            sql: 'SELECT * FROM actions WHERE lead_id = ? ORDER BY created_at DESC',
            args: [id]
        });

        // Fetch recordings history
        const recordingsResult = await db.execute({
            sql: 'SELECT * FROM recordings WHERE lead_id = ? ORDER BY created_at DESC',
            args: [id]
        });

        return NextResponse.json({
            ...lead,
            actions: actionsResult.rows,
            recordings: recordingsResult.rows
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, company, email, phone, status, priority, assigned_to, description, value } = body;

        const updates = [];
        const args = [];

        if (name !== undefined) { updates.push('name = ?'); args.push(name); }
        if (company !== undefined) { updates.push('company = ?'); args.push(company); }
        if (email !== undefined) { updates.push('email = ?'); args.push(email); }
        if (phone !== undefined) { updates.push('phone = ?'); args.push(phone); }
        if (status !== undefined) { updates.push('status = ?'); args.push(status); }
        if (priority !== undefined) { updates.push('priority = ?'); args.push(priority); }
        if (assigned_to !== undefined) { updates.push('assigned_to = ?'); args.push(assigned_to); }
        if (description !== undefined) { updates.push('description = ?'); args.push(description); }
        if (value !== undefined) { updates.push('value = ?'); args.push(value); }

        args.push(id);

        if (updates.length > 0) {
            // Get current lead state for comparison and info
            const oldLeadRes = await db.execute({
                sql: 'SELECT * FROM leads WHERE id = ?',
                args: [id]
            });
            const oldLead = oldLeadRes.rows[0];

            await db.execute({
                sql: `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`,
                args
            });

            // Get updated lead
            const leadRes = await db.execute({
                sql: 'SELECT * FROM leads WHERE id = ?',
                args: [id]
            });
            const lead = leadRes.rows[0];

            // Log status/priority changes
            if (status !== undefined || priority !== undefined) {
                const logs = [];
                if (status !== undefined && status !== oldLead.status) logs.push(`status: ${status}`);
                if (priority !== undefined && priority !== oldLead.priority) logs.push(`priority: ${priority}`);

                if (logs.length > 0) {
                    await db.execute({
                        sql: 'INSERT INTO actions (lead_id, type, content) VALUES (?, ?, ?)',
                        args: [id, 'SystemUpdate', `Modified ${logs.join(', ')}`]
                    });
                }
            }

            // TRIGGER WHATSAPP ON STAGE CHANGE
            if (status !== undefined && status !== oldLead.status) {
                const memberRes = await db.execute({
                    sql: 'SELECT * FROM team WHERE name = ?',
                    args: [lead.assigned_to]
                });
                const member = memberRes.rows[0];

                if (member && lead) {
                    await sendWhatsAppNotification(member, lead, 'stage_change');

                    await db.execute({
                        sql: 'INSERT INTO actions (lead_id, type, content) VALUES (?, ?, ?)',
                        args: [id, 'System', `WhatsApp status update notification dispatched to ${lead.assigned_to}.`]
                    });
                }
            }

            // TRIGGER WHATSAPP ON MANUAL ASSIGNMENT
            if (assigned_to !== undefined && assigned_to !== oldLead.assigned_to) {
                const memberRes = await db.execute({
                    sql: 'SELECT * FROM team WHERE name = ?',
                    args: [assigned_to]
                });
                const member = memberRes.rows[0];

                if (member && lead) {
                    await sendWhatsAppNotification(member, lead, 'new_lead');

                    await db.execute({
                        sql: 'INSERT INTO actions (lead_id, type, content) VALUES (?, ?, ?)',
                        args: [id, 'Assignment', `Lead manually aligned to ${assigned_to}. WhatsApp notification dispatched.`]
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Lead Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
