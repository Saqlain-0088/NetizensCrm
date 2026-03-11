const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./crm.db');

db.all("SELECT email, password, role FROM users WHERE role='superadmin' OR email='superadmin@netizenscrm.com';", [], (err, rows) => {
    if (err) {
        throw err;
    }
    console.log(rows);
    db.close();
});
