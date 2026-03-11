// scripts/migrate-superadmin.js
// Run: node scripts/migrate-superadmin.js

const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await pool.query(`
            -- Plans table
            CREATE TABLE IF NOT EXISTS plans (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                monthly_price NUMERIC DEFAULT 0,
                yearly_price NUMERIC DEFAULT 0,
                max_users INTEGER DEFAULT 5,
                max_leads INTEGER DEFAULT 100,
                max_contacts INTEGER DEFAULT 100,
                storage_gb INTEGER DEFAULT 1,
                ai_features BOOLEAN DEFAULT false,
                api_access BOOLEAN DEFAULT false,
                support_type TEXT DEFAULT 'community',
                features JSONB DEFAULT '[]',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ plans table');

        await pool.query(`
            -- Companies table
            CREATE TABLE IF NOT EXISTS companies (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                admin_email TEXT NOT NULL UNIQUE,
                admin_name TEXT,
                phone TEXT,
                plan_id INTEGER REFERENCES plans(id),
                status TEXT DEFAULT 'trial',
                trial_ends_at TIMESTAMP,
                subscription_ends_at TIMESTAMP,
                user_count INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ companies table');

        await pool.query(`
            -- Activity logs table
            CREATE TABLE IF NOT EXISTS activity_logs (
                id SERIAL PRIMARY KEY,
                actor_email TEXT,
                action TEXT NOT NULL,
                entity_type TEXT,
                entity_id TEXT,
                details JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ activity_logs table');

        await pool.query(`
            -- Payments table
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                company_id INTEGER REFERENCES companies(id),
                amount NUMERIC NOT NULL,
                currency TEXT DEFAULT 'INR',
                status TEXT DEFAULT 'pending',
                plan_id INTEGER REFERENCES plans(id),
                payment_method TEXT,
                transaction_id TEXT,
                invoice_number TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ payments table');

        await pool.query(`
            -- Support tickets table
            CREATE TABLE IF NOT EXISTS support_tickets (
                id SERIAL PRIMARY KEY,
                company_id INTEGER REFERENCES companies(id),
                subject TEXT NOT NULL,
                message TEXT,
                status TEXT DEFAULT 'open',
                priority TEXT DEFAULT 'medium',
                assigned_to TEXT,
                created_by TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ support_tickets table');

        await pool.query(`
            -- Announcements table
            CREATE TABLE IF NOT EXISTS announcements (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'info',
                is_active BOOLEAN DEFAULT true,
                created_by TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ announcements table');

        await pool.query(`
            -- AI feature flags per plan
            CREATE TABLE IF NOT EXISTS ai_feature_flags (
                id SERIAL PRIMARY KEY,
                plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
                lead_scoring BOOLEAN DEFAULT false,
                email_generator BOOLEAN DEFAULT false,
                chat_assistant BOOLEAN DEFAULT false,
                forecasting BOOLEAN DEFAULT false,
                meeting_notes BOOLEAN DEFAULT false,
                smart_notifications BOOLEAN DEFAULT false,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(plan_id)
            );
        `);
        console.log('✓ ai_feature_flags table');

        // Seed default plans
        await pool.query(`
            INSERT INTO plans (name, monthly_price, yearly_price, max_users, max_leads, max_contacts, storage_gb, ai_features, api_access, support_type, features)
            VALUES
              ('Starter',  999,  9990,  3,   100,  200,  1,  false, false, 'community', '["Leads","Contacts","Pipeline","Tasks"]'),
              ('Growth',  2499, 24990, 10,  1000, 5000,  5,  true,  false, 'email',     '["Leads","Contacts","Pipeline","Tasks","Reports","AI Lead Scoring","AI Email Generator","AI Forecasting"]'),
              ('Enterprise', 4999, 49990, 50, 99999, 99999, 50, true, true, 'priority', '["All Features","Custom Integrations","Dedicated Support","API Access","AI Suite","White Label"]')
            ON CONFLICT DO NOTHING;
        `);
        console.log('✓ Seeded default plans');

        // Seed AI flags for plans
        await pool.query(`
            INSERT INTO ai_feature_flags (plan_id, lead_scoring, email_generator, chat_assistant, forecasting, meeting_notes, smart_notifications)
            SELECT id, false, false, false, false, false, false FROM plans WHERE name = 'Starter'
            ON CONFLICT DO NOTHING;
        `);
        await pool.query(`
            INSERT INTO ai_feature_flags (plan_id, lead_scoring, email_generator, chat_assistant, forecasting, meeting_notes, smart_notifications)
            SELECT id, true, true, true, true, false, false FROM plans WHERE name = 'Growth'
            ON CONFLICT DO NOTHING;
        `);
        await pool.query(`
            INSERT INTO ai_feature_flags (plan_id, lead_scoring, email_generator, chat_assistant, forecasting, meeting_notes, smart_notifications)
            SELECT id, true, true, true, true, true, true FROM plans WHERE name = 'Enterprise'
            ON CONFLICT DO NOTHING;
        `);
        console.log('✓ Seeded AI feature flags');

        // Seed sample companies
        await pool.query(`
            INSERT INTO companies (name, admin_email, admin_name, phone, status, trial_ends_at, user_count)
            VALUES
              ('Lumina Corp', 'admin@lumina.io', 'Lumina Admin', '+91 9000000001', 'active', NULL, 5),
              ('TechVision Ltd', 'admin@techvision.io', 'Rajan Mehta', '+91 9000000002', 'trial', NOW() + INTERVAL '7 days', 2),
              ('Nexus Dynamics', 'hello@nexus.com', 'Sara Khan', '+91 9000000003', 'active', NULL, 8),
              ('BlueSky Solutions', 'admin@bluesky.com', 'Arjun Dev', '+91 9000000004', 'expired', NULL, 3),
              ('GrowFast Inc', 'lead@growfast.io', 'Meera Singh', '+91 9000000005', 'trial', NOW() + INTERVAL '3 days', 1)
            ON CONFLICT (admin_email) DO NOTHING;
        `);
        console.log('✓ Seeded sample companies');

        // Seed sample announcements
        await pool.query(`
            INSERT INTO announcements (title, message, type, created_by)
            VALUES
              ('🚀 AI Features Launched!', 'AI Lead Scoring and Email Generator are now live for Growth and Enterprise plans.', 'success', 'superadmin@netizenscrm.com'),
              ('🔧 Scheduled Maintenance', 'The platform will undergo maintenance on March 15 from 2AM to 4AM IST.', 'warning', 'superadmin@netizenscrm.com')
            ON CONFLICT DO NOTHING;
        `);
        console.log('✓ Seeded announcements');

        // Seed some payments
        await pool.query(`
            INSERT INTO payments (company_id, amount, status, payment_method, invoice_number)
            SELECT c.id, 2499, 'success', 'Razorpay', CONCAT('INV-', c.id, '-001') FROM companies c WHERE c.admin_email = 'admin@lumina.io'
            ON CONFLICT DO NOTHING;
        `);

        console.log('\n✅ Super Admin DB migration complete!');
    } catch (e) {
        console.error('Migration error:', e.message);
    } finally {
        pool.end();
    }
}
run();
