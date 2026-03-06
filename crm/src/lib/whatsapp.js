/**
 * WhatsApp Notification Service (Mock)
 * In a production environment, you would use a provider like Twilio, Wati, or Meta WhatsApp Business API.
 */

export async function sendWhatsAppNotification(member, lead, type = 'new_lead') {
    let message = '';

    if (type === 'new_lead') {
        message = `🚀 *New Lead Assigned!*\n\nHello ${member.name},\nA new high-potential lead has been assigned to you.\n\n*Company:* ${lead.company || lead.name}\n*Deal Value:* $${(lead.value || 0).toLocaleString()}\n*Status:* ${lead.status}\n\nCheck your dashboard: http://localhost:3000/leads/${lead.id}`;
    } else if (type === 'stage_change') {
        message = `📈 *Lead Stage Updated!*\n\nHello ${member.name},\nThe status of your lead "${lead.name}" has changed.\n\n*Company:* ${lead.company || 'N/A'}\n*New Status:* ${lead.status}\n*Deal Value:* $${(lead.value || 0).toLocaleString()}\n\nView updates: http://localhost:3000/leads/${lead.id}`;
    } else {
        message = `🔔 *Lead Update*\n\nHello ${member.name},\nThere is an update on lead: ${lead.name}.\n\nView details: http://localhost:3000/leads/${lead.id}`;
    }

    console.log(`[WHATSAPP SERVICE] Sending ${type} message to ${member.phone || 'UNKNOWN'} (${member.name}):`);
    console.log(`--------------------------------------------------`);
    console.log(message);
    console.log(`--------------------------------------------------`);

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
        success: true,
        provider: 'Mock_WhatsApp_Gateway',
        type: type,
        timestamp: new Date().toISOString()
    };
}
