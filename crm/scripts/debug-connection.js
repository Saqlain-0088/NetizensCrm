
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function test() {
    // Extracting parts from the known URL format
    const project_id = 'nzjgilvjrysbtgyzzlum';
    const raw_password = 'DRftgyhu!@!';

    console.log('Testing connection with config object (Session Pooler)...');
    const pool = new Pool({
        user: `postgres.${project_id}`,
        password: raw_password,
        host: 'aws-1-ap-south-1.pooler.supabase.com',
        port: 5432,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query('SELECT 1');
        console.log('SUCCESS: Connected to database.');
        const users = await pool.query('SELECT email, password FROM users');
        console.log('USERS_FOUND:', users.rows.length);
        users.rows.forEach(user => {
            console.log(`User: ${user.email} / Password: ${user.password}`);
        });
    } catch (err) {
        console.error('FAILURE:', err.message);
    } finally {
        await pool.end();
    }
}

test();
