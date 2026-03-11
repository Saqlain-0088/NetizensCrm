import { config } from 'dotenv';
import pkg from 'pg';
config({ path: '.env.local' });

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function getOtps() {
    try {
        const result = await pool.query('SELECT * FROM otps ORDER BY expires_at DESC LIMIT 5;');
        console.log('--- RECENT OTPS ---');
        console.table(result.rows);
    } catch (error) {
        console.error('Error fetching otps:', error);
    } finally {
        await pool.end();
    }
}

getOtps();
