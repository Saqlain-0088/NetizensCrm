const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'crm.db');
const db = new Database(dbPath);

console.log('Migrating Database for Recording History...');

try {
    db.exec(`
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
    console.log('Created recordings table.');
} catch (e) {
    console.error('Error creating recordings table:', e);
}

console.log('Migration completed.');
