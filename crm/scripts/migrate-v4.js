const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'crm.db');
const db = new Database(dbPath);

console.log('Creating Team Management Schema...');

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS team (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'Agent',
            avatar TEXT,
            status TEXT DEFAULT 'Active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Seed some initial team members
    const checkTeam = db.prepare('SELECT COUNT(*) as count FROM team').get();
    if (checkTeam.count === 0) {
        const insert = db.prepare('INSERT INTO team (name, email, role, status) VALUES (?, ?, ?, ?)');
        insert.run('Sarah Jenkins', 'sarah@enterprise.com', 'Senior Lead Closer', 'Active');
        insert.run('Michael Chen', 'michael@enterprise.com', 'Account Executive', 'Active');
        insert.run('Alex Rivera', 'alex@enterprise.com', 'Technical Sales', 'Away');
        console.log('Seeded initial team members.');
    }
} catch (e) {
    console.error('Error creating team table:', e);
}

console.log('Team schema migration completed.');
