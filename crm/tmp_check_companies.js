import db from './src/lib/db.js';

async function check() {
    try {
        const res = await db.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'companies'");
        console.log('Columns:', res.rows.map(r => r.column_name));
    } catch (e) {
        console.error(e);
    }
}
check();
