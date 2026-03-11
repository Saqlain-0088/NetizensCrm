// src/lib/ai.js
// Mock AI Service for CRM Features

/**
 * Simulates an API call with a delay
 * @param {number} ms 
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * MOCK: AI Lead Scoring
 * @param {Object} lead - The lead object to score
 * @returns {Promise<{score: string, probability: number, reasoning: string, riskLevel: string, riskReason: string}>}
 */
export async function scoreLead(lead) {
    await delay(800); // Simulate network latency

    // Simple deterministic mock based on lead data
    const val = lead.value || 0;

    if (val > 10000 || lead.status === 'Negotiation') {
        return {
            score: 'Hot Lead',
            probability: 90,
            reasoning: 'High estimated value and advanced stage indicate strong buying intent.',
            riskLevel: 'Low',
            riskReason: 'Active engagement and high value.'
        };
    } else if (val > 2000 || lead.status === 'Contacted') {
        return {
            score: 'Warm Lead',
            probability: 60,
            reasoning: 'Initial contact made, showing moderate interest.',
            riskLevel: 'Medium',
            riskReason: 'Needs consistent follow-up to move to next stage.'
        };
    }

    return {
        score: 'Cold Lead',
        probability: 20,
        reasoning: 'New or inactive lead with little engagement history.',
        riskLevel: 'High',
        riskReason: 'At risk of dropping off if not contacted soon.'
    };
}

/**
 * MOCK: AI Email Generator
 * @param {Object} lead 
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
export async function generateEmail(lead, prompt) {
    await delay(1200);

    const companyStr = lead.company ? ` at ${lead.company}` : '';

    if (prompt && prompt.toLowerCase().includes('follow')) {
        return `Subject: Following up on our recent conversation\n\nHi ${lead.name},\n\nI hope you're having a great week${companyStr}.\n\nI just wanted to float this to the top of your inbox. Let me know if you have any questions about how NetizensCRM can help streamline your sales process.\n\nBest regards,\n[Your Name]`;
    }

    return `Subject: Introduction to NetizensCRM\n\nHi ${lead.name},\n\nI noticed you're looking for solutions${companyStr}. NetizensCRM can help you manage your pipeline and close deals faster.\n\nAre you available for a quick 10-minute chat this week?\n\nBest,\n[Your Name]`;
}

export async function summarizeNotes(text) {
    if (process.env.OPENAI_API_KEY && !text.includes('API KEY REQUIRED') && !text.includes('Mock Transcription Active')) {
        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a CRM assistant. Summarize the following sales call transcript into a brief 2-sentence summary, then on a new line output "ACTION:" followed by exactly one clear action item.' },
                        { role: 'user', content: text }
                    ]
                })
            });
            const data = await res.json();
            if (data.choices && data.choices[0]) {
                const result = data.choices[0].message.content || '';
                const parts = result.split('ACTION:');
                return {
                    summary: parts[0]?.trim() || result,
                    actionItem: parts[1]?.trim() || 'Review summary for specific action items.'
                };
            }
        } catch (e) {
            console.error('AI summary error:', e);
        }
    }

    await delay(1500);

    return {
        summary: `[Mock AI Summary of: "${text.substring(0, 30)}..."] Client expressed interest in features. Need to follow up.`,
        actionItem: `[Mock] Send proposal or check back next week.`
    };
}

/**
 * MOCK: AI Sales Forecasting
 * @param {Array} leads - List of all leads in pipeline
 * @returns {Promise<{expectedRevenue: number, confidence: string, analysis: string}>}
 */
export async function generateForecast(leads) {
    await delay(1000);

    const totalVal = leads.reduce((acc, l) => acc + (parseInt(l.value) || 0), 0);
    const expected = Math.round(totalVal * 0.45); // highly simplified expected value calculation

    return {
        expectedRevenue: expected,
        confidence: 'Moderate',
        analysis: `Based on your current pipeline of ${leads.length} active deals, historical win rates suggest closing approximately 45% of total pipeline value.`
    };
}

/**
 * MOCK: AI Chat Assistant
 * @param {string} query
 * @param {Array} context - Recent leads or user data
 * @returns {Promise<string>}
 */
export async function chatAssistant(query, context) {
    await delay(1500);

    const q = query.toLowerCase();
    if (q.includes('follow') || q.includes('inactive')) {
        return "I found 3 leads that haven't been contacted in the last 5 days. I recommend reaching out to: Sarah Connor, John Wick, and Ellen Ripley.";
    }

    if (q.includes('revenue') || q.includes('forecast')) {
        return "Your current pipeline value is looking healthy. If you close your 'Hot' leads this month, you're on track to exceed your quota.";
    }

    return "I'm the NetizensCRM AI Assistant. I can help you analyze your pipeline, suggest follow-ups, and summarize notes. What would you like to know?";
}
