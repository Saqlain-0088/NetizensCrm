const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'crm.db');
const db = new Database(dbPath);

console.log('Updating Team Schema for WhatsApp Integration...');

try {
    db.exec(`
        ALTER TABLE team ADD COLUMN phone TEXT;
    `);
    console.log('Added phone column to team table.');

    // Update existing members with dummy numbers for demo
    db.prepare("UPDATE team SET phone = '+919876543210' WHERE email = 'sarah@enterprise.com'").run();
    db.prepare("UPDATE team SET phone = '+919999999999' WHERE email = 'michael@enterprise.com'").run();
    db.prepare("UPDATE team SET phone = '+918888888888' WHERE email = 'alex@enterprise.com'").run();

} catch (e) {
    if (e.message.includes('duplicate column name')) {
        console.log('Phone column already exists.');
    } else {
        console.error('Error updating team table:', e);
    }
}

console.log('WhatsApp schema update completed.');
