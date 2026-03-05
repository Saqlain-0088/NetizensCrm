/**
 * WhatsApp Notification Service (Mock)
 * In a production environment, you would use a provider like Twilio, Wati, or Meta WhatsApp Business API.
 */

export async function sendWhatsAppNotification(member, lead) {
    const message = `🚀 *New Lead Assigned!*\n\nHello ${member.name},\nAn enterprise-grade lead has been aligned to your portfolio.\n\n*Company:* ${lead.company || lead.name}\n*Deal Value:* $${lead.value?.toLocaleString()}\n*Status:* ${lead.status}\n\nCheck your dashboard for full intelligence: http://localhost:3000/leads/${lead.id}`;

    console.log(`[WHATSAPP SERVICE] Sending message to ${member.phone || 'UNKNOWN'}:`);
    console.log(`--------------------------------------------------`);
    console.log(message);
    console.log(`--------------------------------------------------`);

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
        success: true,
        provider: 'Mock_WhatsApp_Gateway',
        timestamp: new Date().toISOString()
    };
}
