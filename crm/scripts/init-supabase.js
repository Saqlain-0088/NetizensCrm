
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function init() {
    console.log('🚀 Initializing Full Supabase Schema...');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // 1. Users table
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
        console.log('✅ Users table ready.');

        // 2. Leads table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS leads (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT,
                company TEXT,
                phone TEXT,
                source TEXT DEFAULT 'Manual',
                status TEXT DEFAULT 'New',
                priority TEXT DEFAULT 'Medium',
                description TEXT,
                value INTEGER DEFAULT 0,
                tags TEXT,
                location TEXT,
                assigned_to TEXT,
                last_contacted_at TIMESTAMP,
                last_reminder_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Leads table ready.');

        // 3. Actions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS actions (
                id SERIAL PRIMARY KEY,
                lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
                parent_action_id INTEGER,
                type TEXT NOT NULL,
                content TEXT NOT NULL,
                created_by TEXT DEFAULT 'System',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Actions table ready.');

        // 4. Team table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS team (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                role TEXT DEFAULT 'Agent',
                status TEXT DEFAULT 'Active',
                phone TEXT,
                avatar TEXT,
                performance_score INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Team table ready.');

        // 5. Recordings table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS recordings (
                id SERIAL PRIMARY KEY,
                lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
                url TEXT NOT NULL,
                filename TEXT,
                duration INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Recordings table ready.');

        // 6. Notes table (from migrate-v9)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                lead_id TEXT,
                audio_url TEXT,
                transcribed_text TEXT,
                duration INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Notes table ready.');

        // 7. Contacts table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                company TEXT,
                role TEXT,
                last_contacted_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Contacts table ready.');

        // Seeding initial team if empty
        const teamCheck = await pool.query('SELECT COUNT(*) FROM team');
        if (parseInt(teamCheck.rows[0].count) === 0) {
            console.log('🌱 Seeding initial team...');
            await pool.query(`
                INSERT INTO team (name, email, role, status, phone) VALUES
                ('Sarah Jenkins', 'sarah@enterprise.com', 'Lead Closer', 'Active', '+919876543210'),
                ('Michael Chen', 'michael@enterprise.com', 'Account Executive', 'Active', '+919999999999'),
                ('Alex Rivera', 'alex@enterprise.com', 'Sales Development', 'Active', '+918888888888')
            `);
        }

        // Seeding admin if empty
        const adminCheck = await pool.query('SELECT COUNT(*) FROM users WHERE email = $1', ['admin@lumina.io']);
        if (parseInt(adminCheck.rows[0].count) === 0) {
            console.log('🌱 Seeding admin user...');
            await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
                ['Admin User', 'admin@lumina.io', 'admin123', 'admin']
            );
        }

        // Seeding leads if empty
        const leadsCheck = await pool.query('SELECT COUNT(*) FROM leads');
        if (parseInt(leadsCheck.rows[0].count) === 0) {
            console.log('🌱 Seeding initial leads...');
            await pool.query(`
                INSERT INTO leads (name, company, email, phone, value, source, status, priority, assigned_to) VALUES
                ('Sarah Connor', 'Cyberdyne Systems', 'sarah@cyberdyne.net', '+1 555-0101', 125000, 'LinkedIn', 'Qualified', 'High', 'Sarah Jenkins'),
                ('Elon Reeve', 'SpaceX', 'elon@spacex.com', '+1 555-0202', 5000000, 'Referral', 'Negotiation', 'Urgent', 'Sarah Jenkins'),
                ('Tim Cook', 'Apple', 'tcook@apple.com', '+1 408-996-1010', 2500000, 'Conference', 'Won', 'High', 'Alex Rivera')
            `);
        }

        console.log('\n✨ Supabase Schema Initialization Successful!');
    } catch (err) {
        console.error('❌ Initialization failed:', err.message);
    } finally {
        await pool.end();
    }
}

init();
