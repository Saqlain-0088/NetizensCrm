const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const users = await pool.query('SELECT * FROM users');
        const adminEmail = 'admin@lumina.io';

        const adminLeadsResult = await pool.query('SELECT * FROM leads WHERE created_by_email = $1', [adminEmail]);
        const adminLeads = adminLeadsResult.rows;

        console.log(`Found ${adminLeads.length} leads for admin. Duplicating for other users...`);

        for (const user of users.rows) {
            if (user.email === adminEmail) continue;

            const userLeads = await pool.query('SELECT count(*) FROM leads WHERE created_by_email = $1', [user.email]);
            if (parseInt(userLeads.rows[0].count) > 0) continue;

            console.log(`Copying leads for ${user.email}...`);
            for (const lead of adminLeads) {
                // Ignore columns that might be specific, just insert basic ones.
                await pool.query(
                    `INSERT INTO leads (name, company, status, value, priority, created_by_email, created_at, updated_at) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [lead.name, lead.company, lead.status, lead.value, lead.priority, user.email, lead.created_at, lead.updated_at]
                );
            }
        }
        console.log("Successfully duplicated leads for all active test users!");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
run();
