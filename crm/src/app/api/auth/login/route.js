import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const result = await db.execute({
            sql: 'SELECT * FROM users WHERE email = ?',
            args: [email]
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const user = result.rows[0];

        // Check password (bcrypt hash or legacy plain for existing users)
        const isBcrypt = user.password?.startsWith('$2');
        const valid = isBcrypt
            ? await bcrypt.compare(password, user.password)
            : user.password === password;

        if (!valid) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const sessionData = JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            plan: user.plan || 'free'
        });

        (await cookies()).set('crm_session', sessionData, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return NextResponse.json({
            message: 'Login successful',
            user: { email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
