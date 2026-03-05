const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'crm.db');
const db = new Database(dbPath);

console.log('Migrating Database for Authentication...');

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'User',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

const createOtpsTable = `
CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

try {
    db.exec(createUsersTable);
    db.exec(createOtpsTable);
    console.log('Authentication tables created successfully.');
    
    // Check if we already have a default user, if not add one
    const checkUser = db.prepare('SELECT count(*) as count FROM users WHERE email = ?').get('admin@lumina.io');
    if (checkUser.count === 0) {
        db.prepare('INSERT INTO users (email, name, role) VALUES (?, ?, ?)').run('admin@lumina.io', 'Admin User', 'Super Admin');
        console.log('Default admin user created.');
    }
} catch (error) {
    console.error('Migration failed:', error);
} finally {
    db.close();
}
