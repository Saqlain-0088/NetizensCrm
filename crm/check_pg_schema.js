import db from './src/lib/db.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkSchema() {
    try {
        const tables = ['users', 'leads', 'otps', 'team', 'actions'];
        console.log("Checking schema for tables...");
        for (const table of tables) {
            console.log(`--- Schema for ${table} ---`);
            const result = await db.execute(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.table(result.rows);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSchema();
