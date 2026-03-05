
const { Pool } = require('pg');

const projectId = 'nzjgilvjrysbtgyzzlum';
const passwords = ['DRftgyhu!@!', '[DRftgyhu!@!]'];

async function tryConnect(config, label) {
    const pool = new Pool({
        ...config,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        await pool.query('SELECT 1');
        console.log(`SUCCESS: ${label}`);
        return true;
    } catch (err) {
        console.log(`FAILURE: ${label} - ${err.message}`);
        return false;
    } finally {
        await pool.end();
    }
}

async function runTests() {
    for (const pw of passwords) {
        console.log(`\n--- Testing Password: ${pw} ---`);

        await tryConnect({
            user: `postgres.${projectId}`,
            password: pw,
            host: 'aws-1-ap-south-1.pooler.supabase.com',
            port: 5432,
            database: 'postgres'
        }, `Pooler (${projectId}) with password ${pw}`);
    }
}

runTests();
