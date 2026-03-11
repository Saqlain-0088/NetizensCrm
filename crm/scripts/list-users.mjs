import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import db from '../src/lib/db.js';

async function run() {
    try {
        const users = await db.execute('SELECT email FROM users');
        console.log("Users:", users.rows);

        const leadsCount = await db.execute('SELECT created_by_email, COUNT(*) as count FROM leads GROUP BY created_by_email');
        console.log("Leads per user:", leadsCount.rows);

        if (users.rows.length > 0 && leadsCount.rows.length > 0) {
            const adminEmail = "admin@lumina.com"; // Maybe? We will see output
            // Let's just output and decide.
        }
    } catch (e) {
        console.error(e);
    }
}
run();
