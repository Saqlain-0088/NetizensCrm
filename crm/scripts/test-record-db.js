/**
 * Test record API database logic (insert, ON CONFLICT, dedup).
 * Run: node scripts/test-record-db.js
 * Requires: DATABASE_URL in .env.local
 */
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function run() {
    if (!process.env.DATABASE_URL) {
        console.log('SKIP: DATABASE_URL not set');
        process.exit(0);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    // Use existing lead (required for FK)
    const { rows: leads } = await pool.query('SELECT id FROM leads LIMIT 1');
    const testLeadId = leads.length ? leads[0].id : 1;
    const testFilename = `recording-${testLeadId}-test-dedup-${Date.now()}.webm`;
    const testUrl = 'https://example.com/test.webm';

    try {
        // 1. Insert first recording
        const r1 = await pool.query(
            `INSERT INTO recordings (lead_id, url, filename, duration) VALUES ($1, $2, $3, 0)
             ON CONFLICT (lead_id, filename) DO NOTHING RETURNING id`,
            [testLeadId, testUrl, testFilename]
        );
        if (r1.rowCount !== 1) {
            throw new Error('First insert should return 1 row, got ' + r1.rowCount);
        }
        console.log('PASS: First insert succeeds');

        // 2. Duplicate insert (ON CONFLICT) should return 0 rows
        const r2 = await pool.query(
            `INSERT INTO recordings (lead_id, url, filename, duration) VALUES ($1, $2, $3, 0)
             ON CONFLICT (lead_id, filename) DO NOTHING RETURNING id`,
            [testLeadId, testUrl + '-dup', testFilename]
        );
        if (r2.rowCount !== 0) {
            throw new Error('Duplicate insert should return 0 rows (conflict), got ' + r2.rowCount);
        }
        console.log('PASS: Duplicate insert returns 0 (no double insert)');

        // 3. Verify only one row exists
        const { rows } = await pool.query(
            'SELECT COUNT(*) as c FROM recordings WHERE lead_id = $1 AND filename = $2',
            [testLeadId, testFilename]
        );
        if (parseInt(rows[0].c, 10) !== 1) {
            throw new Error('Should have exactly 1 row, got ' + rows[0].c);
        }
        console.log('PASS: Exactly one recording in DB');

        // 4. Cleanup (only our test recording)
        await pool.query('DELETE FROM recordings WHERE lead_id = $1 AND filename = $2', [testLeadId, testFilename]);
        console.log('PASS: Cleanup done');

        console.log('\nAll record DB tests passed.');
    } catch (e) {
        console.error('FAIL:', e.message);
        await pool.query('DELETE FROM recordings WHERE lead_id = $1 AND filename = $2', [testLeadId, testFilename]).catch(() => {});
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
