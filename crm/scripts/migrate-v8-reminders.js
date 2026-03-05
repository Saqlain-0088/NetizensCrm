const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'crm.db');
const db = new Database(dbPath);

console.log('Adding reminder tracking to leads table...');

try {
    // Check if column already exists
    const tableInfo = db.prepare('PRAGMA table_info(leads)').all();
    const hasColumn = tableInfo.some(col => col.name === 'last_reminder_at');

    if (!hasColumn) {
        db.exec('ALTER TABLE leads ADD COLUMN last_reminder_at DATETIME');
        console.log('✅ Added "last_reminder_at" column to leads table.');
    } else {
        console.log('✅ "last_reminder_at" column already exists.');
    }

    console.log('Migration completed successfully!');
} catch (error) {
    console.error('Migration failed:', error);
} finally {
    db.close();
}
