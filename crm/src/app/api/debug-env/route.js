import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
    const urlSet = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const keySet = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const keyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length ?? 0;
    const keyFormatOk = keyLength > 100 && process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ');

    let storageOk = false;
    let storageError = null;

    if (urlSet && keySet) {
        try {
            const { error } = await supabase.storage.listBuckets();
            storageOk = !error;
            storageError = error?.message ?? null;
        } catch (e) {
            storageError = e?.message ?? 'Unknown error';
        }
    }

    const allOk = urlSet && keySet && keyFormatOk && storageOk;

    return NextResponse.json({
        NEXT_PUBLIC_SUPABASE_URL: urlSet ? 'SET' : 'MISSING',
        SUPABASE_SERVICE_ROLE_KEY: keySet ? 'SET' : 'MISSING',
        key_format_valid: keyFormatOk,
        supabase_connection: storageOk ? 'OK' : (storageError || 'FAILED'),
        overall: allOk ? 'VERIFIED' : 'NOT_READY',
        hint: !allOk ? (urlSet && keySet && !keyFormatOk
            ? 'Key may be wrong type (use service_role, not anon)'
            : urlSet && keySet && !storageOk
                ? `Storage error: ${storageError}`
                : !urlSet || !keySet
                    ? 'Add both env vars in Vercel'
                    : '') : '',
    });
}
