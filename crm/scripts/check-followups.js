const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'crm.db');
const db = new Database(dbPath);

console.log('🔍 Checking for overdue follow-ups...\n');

try {
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

    // Find overdue leads
    const overdueLeads = db.prepare(`
        SELECT l.*, t.phone, t.email as team_email
        FROM leads l
        LEFT JOIN team t ON l.assigned_to = t.name
        WHERE l.status NOT IN ('Won', 'Lost')
        AND (
            (l.priority = 'Urgent' AND (l.last_contacted_at IS NULL OR l.last_contacted_at < ?))
            OR (l.priority != 'Urgent' AND (l.last_contacted_at IS NULL OR l.last_contacted_at < ?))
        )
        AND (l.last_reminder_at IS NULL OR l.last_reminder_at < ?)
    `).all(threeDaysAgo, sevenDaysAgo, oneDayAgo);

    if (overdueLeads.length === 0) {
        console.log('✅ No overdue leads found. All caught up!');
        db.close();
        return;
    }

    console.log(`📊 Found ${overdueLeads.length} overdue lead(s)\n`);

    let remindersSent = 0;

    for (const lead of overdueLeads) {
        const daysSinceContact = lead.last_contacted_at
            ? Math.floor((now - new Date(lead.last_contacted_at)) / (1000 * 60 * 60 * 24))
            : 'Never';

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📋 Lead: ${lead.name} (${lead.company || 'No company'})`);
        console.log(`👤 Assigned to: ${lead.assigned_to || 'Unassigned'}`);
        console.log(`⚡ Priority: ${lead.priority}`);
        console.log(`📅 Last contacted: ${daysSinceContact} days ago`);
        console.log(`💰 Value: $${lead.value?.toLocaleString() || 0}`);

        // Send WhatsApp notification (mock)
        const message = `🚨 *Follow-up Reminder*\n\nHello ${lead.assigned_to},\n\nLead *${lead.name}* from ${lead.company || 'Unknown'} needs follow-up!\n\n📊 Priority: ${lead.priority}\n💰 Value: $${lead.value?.toLocaleString() || 0}\n📅 Last Contact: ${daysSinceContact} days ago\n\n🔗 View: http://localhost:3000/leads/${lead.id}`;

        console.log('\n📱 WhatsApp Notification:');
        console.log('─────────────────────────────────────────');
        console.log(message);
        console.log('─────────────────────────────────────────\n');

        // Update last_reminder_at
        db.prepare('UPDATE leads SET last_reminder_at = ? WHERE id = ?')
            .run(now.toISOString(), lead.id);

        // Log action
        db.prepare('INSERT INTO actions (lead_id, type, content, created_by) VALUES (?, ?, ?, ?)')
            .run(lead.id, 'System', `Follow-up reminder sent to ${lead.assigned_to}`, 'System');

        remindersSent++;
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n✅ Sent ${remindersSent} reminder(s) successfully!`);

} catch (error) {
    console.error('❌ Error:', error);
} finally {
    db.close();
}
