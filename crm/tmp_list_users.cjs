
const pkg = require('pg');
const { Pool } = pkg;
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function run() {
    try {
        const result = await pool.query('SELECT name, email, role FROM users');
        console.table(result.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
run();
