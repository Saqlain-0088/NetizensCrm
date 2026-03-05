import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'crm.db');
const db = new Database(dbPath);

console.log('Migrating Contacts Table...');

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            company TEXT,
            role TEXT,
            last_contacted_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('Contacts table created successfully.');
} catch (error) {
    console.error('Migration failed:', error);
}
