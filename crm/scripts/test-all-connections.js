
const { Pool } = require('pg');

const projectIds = ['nzjgilvjrysbtgyzzlum', 'umrbazihwqdbbhqkqaiz'];
const password = 'DRftgyhu!@!';

async function tryConnect(config, label) {
    const pool = new Pool({
        ...config,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        await pool.query('SELECT 1');
        console.log(`SUCCESS: ${label}`);

        // If success, get the users
        try {
            const users = await pool.query('SELECT email, password FROM users');
            console.log('USERS_FOUND:', users.rows.map(u => u.email).join(', '));
        } catch (e) {
            console.log('Could not fetch users, maybe table doesnt exist yet.');
        }

        return true;
    } catch (err) {
        console.log(`FAILURE: ${label} - ${err.message}`);
        return false;
    } finally {
        await pool.end();
    }
}

async function runTests() {
    for (const projectId of projectIds) {
        console.log(`\n--- Testing Project: ${projectId} ---`);

        // Test Pooler
        await tryConnect({
            user: `postgres.${projectId}`,
            password: password,
            host: 'aws-1-ap-south-1.pooler.supabase.com',
            port: 5432,
            database: 'postgres'
        }, `Pooler (${projectId})`);

        // Test Direct
        await tryConnect({
            user: 'postgres',
            password: password,
            host: `db.${projectId}.supabase.co`,
            port: 5432,
            database: 'postgres'
        }, `Direct (${projectId})`);
    }
}

runTests();
