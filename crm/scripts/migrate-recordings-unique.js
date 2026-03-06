/**
 * Migration: Add unique constraint on recordings(lead_id, filename) to prevent duplicates.
 * Run: node scripts/migrate-recordings-unique.js
 * Requires: DATABASE_URL in .env.local
 */
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // 1. Remove duplicate recordings (keep latest by id)
        const { rows: dupes } = await pool.query(`
            SELECT lead_id, filename, COUNT(*) as cnt
            FROM recordings
            WHERE filename IS NOT NULL
            GROUP BY lead_id, filename
            HAVING COUNT(*) > 1
        `);

        if (dupes.length > 0) {
            console.log('Removing', dupes.length, 'duplicate recording groups...');
            for (const d of dupes) {
                const { rows: toDelete } = await pool.query(
                    `SELECT id FROM recordings WHERE lead_id = $1 AND filename = $2 ORDER BY id ASC`,
                    [d.lead_id, d.filename]
                );
                const keepId = toDelete[toDelete.length - 1].id;
                const deleteIds = toDelete.slice(0, -1).map(r => r.id);
                await pool.query(
                    `DELETE FROM recordings WHERE id = ANY($1)`,
                    [deleteIds]
                );
                console.log('  Kept id', keepId, 'for', d.filename);
            }
        }

        // 2. Ensure no NULL filenames (needed for unique constraint)
        await pool.query(`UPDATE recordings SET filename = 'legacy-' || id WHERE filename IS NULL`);

        // 3. Add unique constraint (allows dedup via ON CONFLICT)
        await pool.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS recordings_lead_filename_unique
            ON recordings(lead_id, filename)
        `);
        console.log('✅ Unique index recordings_lead_filename_unique added.');
    } catch (e) {
        console.error('Migration failed:', e.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
