import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { default as db } from './src/lib/db.js';
import bcrypt from 'bcryptjs';

async function testLogin() {
    const email = 'superadmin@netizenscrm.com';
    const password = 'SuperAdmin!2026';

    // Simulate login
    const result = await db.execute({
        sql: 'SELECT * FROM users WHERE email = $1',
        args: [email]
    });

    const user = result.rows[0];
    const isBcrypt = user.password?.startsWith('$2');
    const valid = isBcrypt
        ? await bcrypt.compare(password, user.password)
        : user.password === password;

    console.log('Valid password:', valid);
    process.exit(0);
}

testLogin();
