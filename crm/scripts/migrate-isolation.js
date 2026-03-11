/**
 * Migration: Add data isolation (ownership) to leads and related tables.
 * Run: node scripts/migrate-isolation.js
 */
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🚀 Starting Data Isolation Migration...');

        const tables = ['leads', 'actions', 'team', 'recordings', 'notes', 'contacts'];

        for (const table of tables) {
            console.log(`Adding created_by_email to ${table}...`);
            await pool.query(`
                ALTER TABLE ${table}
                ADD COLUMN IF NOT EXISTS created_by_email TEXT
            `);
        }

        // Assign existing leads and related data to a default system admin or leave for legacy
        // For safety, let's tag them with 'system@internal' or similar if they are null
        console.log('Tagging existing data with system owner...');
        await pool.query("UPDATE leads SET created_by_email = 'admin@lumina.io' WHERE created_by_email IS NULL");
        await pool.query("UPDATE actions SET created_by_email = 'admin@lumina.io' WHERE created_by_email IS NULL");
        await pool.query("UPDATE team SET created_by_email = 'admin@lumina.io' WHERE created_by_email IS NULL");

        console.log('✅ Migration complete: created_by_email added and populated for existing records.');
    } catch (e) {
        console.error('Migration failed:', e.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
