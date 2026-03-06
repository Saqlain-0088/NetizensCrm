const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'crm.db');
const db = new Database(dbPath);
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
tables.forEach(table => {
    console.log(`Table: ${table.name}`);
    console.log(table.sql);
    console.log('-------------------');
});
