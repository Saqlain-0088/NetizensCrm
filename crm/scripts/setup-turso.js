/**
 * Turso Database Initialization Script
 * This script sets up the required tables for Lumina CRM on your Turso database.
 * Run this after setting up your TURSO_URL and TURSO_AUTH_TOKEN.
 */

require('dotenv').config();
const { createClient } = require('@libsql/client');

const db = createClient({
    url: process.env.TURSO_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function setup() {
    console.log('🚀 Initializing Turso Database Schema...');

    try {
        // 1. Leads Table
        await db.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        company TEXT,
        phone TEXT,
        source TEXT,
        status TEXT DEFAULT 'New',
        priority TEXT DEFAULT 'Medium',
        assigned_to TEXT,
        description TEXT,
        value INTEGER DEFAULT 0,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Leads table ready.');

        // 2. Actions Table (Timeline)
        await db.execute(`
      CREATE TABLE IF NOT EXISTS actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER NOT NULL,
        parent_action_id INTEGER,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id)
      );
    `);
        console.log('✅ Actions table ready.');

        // 3. Recordings Table
        await db.execute(`
      CREATE TABLE IF NOT EXISTS recordings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        filename TEXT,
        duration INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id)
      );
    `);
        console.log('✅ Recordings table ready.');

        // 4. Team Table
        await db.execute(`
      CREATE TABLE IF NOT EXISTS team (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'Agent',
        status TEXT DEFAULT 'Active',
        phone TEXT,
        avatar TEXT,
        performance_score INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('✅ Team table ready.');

        // 5. Seed Initial Team
        const teamRes = await db.execute('SELECT COUNT(*) as count FROM team');
        if (teamRes.rows[0].count === 0) {
            console.log('🌱 Seeding initial team...');
            const members = [
                ['Sarah Jenkins', 'sarah@enterprise.com', 'Lead Closer', 'Active', '+919876543210'],
                ['Michael Chen', 'michael@enterprise.com', 'Account Executive', 'Active', '+919999999999'],
                ['Alex Rivera', 'alex@enterprise.com', 'Sales Development', 'Active', '+918888888888']
            ];
            for (const m of members) {
                await db.execute({
                    sql: 'INSERT INTO team (name, email, role, status, phone) VALUES (?, ?, ?, ?, ?)',
                    args: m
                });
            }
            console.log('✅ Seeding complete.');
        }

        console.log('\n✨ Turso setup successful! Your CRM is ready for Vercel deployment.');
    } catch (error) {
        console.error('❌ Error initializing Turso:', error);
    }
}

setup();
Riverside,
