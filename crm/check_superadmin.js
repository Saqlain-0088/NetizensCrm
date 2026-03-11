import dotenv from 'dotenv';
import path from 'path';

// Load env vars first
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import bcrypt from 'bcryptjs';

async function checkSuperAdmin() {
    try {
        const email = 'superadmin@netizenscrm.com';
        console.log(`Checking for user: ${email}`);

        // Then import db dynamically
        const { default: db } = await import('./src/lib/db.js');

        const result = await db.execute({
            sql: 'SELECT * FROM users WHERE email = ?',
            args: [email]
        });

        const password = 'SuperAdmin!2026';
        const hash = await bcrypt.hash(password, 10);

        if (result.rows.length === 0) {
            console.log('Superadmin user not found, inserting...');

            await db.execute({
                sql: `
                    INSERT INTO users (email, password, name, role, created_at, updated_at)
                    VALUES ($1, $2, $3, $4, NOW(), NOW())
                `,
                args: [email, hash, 'Super Admin', 'superadmin']
            });
            console.log('Superadmin user created with password:', password);
        } else {
            console.log('Superadmin user found!');
            console.log(result.rows[0]);

            // If the user already exists, let's just update the password and set role to superadmin to be safe
            await db.execute({
                sql: `UPDATE users SET password = $1, role = 'superadmin' WHERE email = $2`,
                args: [hash, email]
            });
            console.log('Updated superadmin password to:', password);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSuperAdmin();
