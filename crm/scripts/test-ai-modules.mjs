import { scoreLead, generateEmail, summarizeNotes, generateForecast, chatAssistant } from '../src/lib/ai.js';

async function runTests() {
    console.log("=== Testing AI Modules ===\n");

    try {
        console.log("1. Testing scoreLead...");
        const hotLead = { value: 15000, status: 'Negotiation', name: 'Acme Corp' };
        const score = await scoreLead(hotLead);
        console.log("Result for Hot Lead:", score);
        console.log("------------------------");

        console.log("2. Testing generateEmail...");
        const email = await generateEmail({ name: 'John Doe', company: 'Acme Corp' }, 'follow up');
        console.log("Generated Email:\n", email);
        console.log("------------------------");

        console.log("3. Testing summarizeNotes...");
        const notes = "Client expressed interest in premium features. Discussed pricing and implementation timeline. They are currently evaluating competitors.";
        const summary = await summarizeNotes(notes);
        console.log("Summary:\n", summary);
        console.log("------------------------");

        console.log("4. Testing generateForecast...");
        const leads = [
            { value: '10000', status: 'Negotiation' },
            { value: '5000', status: 'Contacted' }
        ];
        const forecast = await generateForecast(leads);
        console.log("Forecast:\n", forecast);
        console.log("------------------------");

        console.log("5. Testing chatAssistant...");
        const chat = await chatAssistant("who needs follow up?", []);
        console.log("Chat Reply:\n", chat);
        console.log("------------------------");

        console.log("\nAll AI Modules tested successfully!");
    } catch (e) {
        console.error("Error testing modules:", e);
    }
}

runTests();
