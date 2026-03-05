const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'crm.db');

// In a real app we'd use migrations, but here we can just add columns if they don't exist
const db = new Database(dbPath);

console.log('Migrating Database at', dbPath);

try {
    db.exec(`ALTER TABLE leads ADD COLUMN description TEXT;`);
    console.log('Added description column.');
} catch (e) {
    console.log('Description column might already exist.');
}

try {
    db.exec(`ALTER TABLE leads ADD COLUMN recording_url TEXT;`);
    console.log('Added recording_url column.');
} catch (e) {
    console.log('Recording_url column might already exist.');
}

console.log('Migration completed.');
