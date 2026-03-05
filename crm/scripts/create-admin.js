
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function createAdmin() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Checking for users table...');
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

        console.log(`Checking if user ${email} exists...`);
        const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (check.rows.length === 0) {
            console.log('Creating admin user...');
            await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                [name, email, password, 'admin']
            );
            console.log('Admin user created successfully.');
            console.log('Credentials:');
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        } else {
            console.log('Admin user already exists.');
            console.log(`Email: ${check.rows[0].email}`);
            console.log(`Password: ${check.rows[0].password}`);
        }
    } catch (err) {
        console.error('Error creating admin:', err.message);
    } finally {
        await pool.end();
    }
}

createAdmin();
