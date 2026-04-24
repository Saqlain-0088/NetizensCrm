import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';

// SUPABASE_SERVICE_ROLE_KEY is server-only — never expose it to the client.
// On the client side we fall back to a safe placeholder so the import doesn't crash.
const supabaseKey =
    (typeof window === 'undefined'
        ? process.env.SUPABASE_SERVICE_ROLE_KEY
        : undefined) || 'placeholder-key';

if (typeof window === 'undefined') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn('Supabase credentials missing. Storage functions will fail.');
    }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
