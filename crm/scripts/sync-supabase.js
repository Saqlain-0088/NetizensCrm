
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function test() {
    const project_id = 'nzjgilvjrysbtgyzzlum';
    const raw_password = 'DRftgyhu!@!';

    console.log('--- Testing connection with RAW password (no URL encoding) ---');
    const pool = new Pool({
        user: `postgres.${project_id}`,
        password: raw_password,
        host: 'aws-1-ap-south-1.pooler.supabase.com',
        port: 5432,
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await pool.query('SELECT 1');
        console.log('SUCCESS: Connected to database!');

        console.log('Ensuring users table exists...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const email = 'admin@lumina.io';
        const password = 'admin123';
        const name = 'Admin User';

        console.log(`Ensuring user ${email} exists...`);
        const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (check.rows.length === 0) {
            await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                [name, email, password, 'admin']
            );
            console.log('Admin user created successfully.');
        } else {
            console.log('Admin user already exists.');
        }

    } catch (err) {
        console.error('FAILURE:', err.message);
    } finally {
        await pool.end();
    }
}

test();
