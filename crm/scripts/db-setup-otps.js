import { config } from 'dotenv';
import pkg from 'pg';
config({ path: '.env.local' });

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

async function setup() {
    try {
        console.log('Creating otps table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS otps (
                email VARCHAR(255) PRIMARY KEY,
                otp VARCHAR(6) NOT NULL,
                expires_at TIMESTAMP NOT NULL
            );
        `);
        console.log('Table otps created successfully (or already exists).');
    } catch (error) {
        console.error('Error creating otps table:', error);
    } finally {
        await pool.end();
    }
}

setup();
