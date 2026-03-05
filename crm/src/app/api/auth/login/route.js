import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // 1. Find user by email
        const result = await db.execute({
            sql: 'SELECT * FROM users WHERE email = ?',
            args: [email]
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const user = result.rows[0];

        // 2. Check password
        // In a real application, you would use a library like bcrypt to compare hashes.
        if (user.password !== password) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        // 3. Create Session (simple cookie)
        const sessionData = JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
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
