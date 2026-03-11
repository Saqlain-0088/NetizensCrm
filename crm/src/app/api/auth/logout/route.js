import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    try {
        (await cookies()).delete('crm_session');

        return NextResponse.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error);
        return NextResponse.json({ error: 'Failed to log out' }, { status: 500 });
    }
}
