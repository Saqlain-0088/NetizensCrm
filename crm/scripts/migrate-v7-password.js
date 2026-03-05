const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'crm.db');
const db = new Database(dbPath);

console.log('Migrating Database for Password Authentication...');

try {
    // 1. Add password column to users table if it doesn't exist
    const tableInfo = db.prepare('PRAGMA table_info(users)').all();
    const hasPasswordColumn = tableInfo.some(col => col.name === 'password');

    if (!hasPasswordColumn) {
        db.exec('ALTER TABLE users ADD COLUMN password TEXT');
        console.log('Added "password" column to "users" table.');
    } else {
        console.log('"password" column already exists.');
    }

    // 2. Set a default password for the existing admin user
    // In a real app, this would be hashed.
    db.prepare('UPDATE users SET password = ? WHERE email = ? AND password IS NULL').run('admin123', 'admin@lumina.io');

    // 3. Set a default password for any other users without one
    db.prepare('UPDATE users SET password = ? WHERE password IS NULL').run('password123');

    console.log('Passwords updated successfully.');
} catch (error) {
    console.error('Migration failed:', error);
} finally {
    db.close();
}
