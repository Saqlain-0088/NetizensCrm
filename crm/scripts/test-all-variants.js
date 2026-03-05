
const { Pool } = require('pg');

const project_id = 'nzjgilvjrysbtgyzzlum';
const password = 'CrmAdmin2026';

async function tryConnect(config, label) {
    console.log(`Testing: ${label}...`);
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
    // 1. Transaction Pooler (Port 6543) - Standard for some setups
    await tryConnect({
        user: `postgres.${project_id}`,
        password: password,
        host: 'aws-1-ap-south-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres'
    }, 'Pooler (Port 6543)');

    // 2. Session Pooler (Port 5432)
    await tryConnect({
        user: `postgres.${project_id}`,
        password: password,
        host: 'aws-1-ap-south-1.pooler.supabase.com',
        port: 5432,
        database: 'postgres'
    }, 'Pooler (Port 5432)');

    // 3. Direct Connection (Port 5432)
    await tryConnect({
        user: 'postgres',
        password: password,
        host: `db.${project_id}.supabase.co`,
        port: 5432,
        database: 'postgres'
    }, 'Direct Connection');
}

runTests();
