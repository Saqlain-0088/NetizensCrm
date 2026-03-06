import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
        service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
        node_env: process.env.NODE_ENV,
    });
}
