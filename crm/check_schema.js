const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'crm.db');
const db = new Database(dbPath);
const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='contacts'").get();
console.log(schema ? schema.sql : 'Level table not found');
const leadsSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='leads'").get();
console.log(leadsSchema ? leadsSchema.sql : 'Leads table not found');
