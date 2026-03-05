
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const project_id = 'nzjgilvjrysbtgyzzlum';
const password = 'DRftgyhu!@!';

async function tryConnect(config, label) {
    console.log(`--- Testing: ${label} ---`);
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
    // 1. Standard Pooler (User as postgres.id)
    await tryConnect({
        user: `postgres.${project_id}`,
        password: password,
        host: 'aws-1-ap-south-1.pooler.supabase.com',
        port: 5432,
        database: 'postgres'
    }, 'Standard Pooler (postgres.PROJ_ID)');

    // 2. User as postgres, Password as password, DB as postgres
    await tryConnect({
        user: 'postgres',
        password: password,
        host: 'aws-1-ap-south-1.pooler.supabase.com',
        port: 5432,
        database: 'postgres'
    }, 'Pooler (User=postgres)');

    // 3. User as postgres, DB as project_id
    await tryConnect({
        user: 'postgres',
        password: password,
        host: 'aws-1-ap-south-1.pooler.supabase.com',
        port: 5432,
        database: project_id
    }, 'Pooler (Database=PROJ_ID)');
}

runTests();
