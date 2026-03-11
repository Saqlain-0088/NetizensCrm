/**
 * Migration: Add SaaS fields (plan, company_name) to users table.
 * Run: node scripts/migrate-saas.js
 */
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
            ADD COLUMN IF NOT EXISTS company_name TEXT
        `);
        console.log('✅ SaaS migration complete: users.plan, users.company_name');
    } catch (e) {
        console.error('Migration failed:', e.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
