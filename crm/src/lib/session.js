import { cookies } from 'next/headers';

export async function getSession() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('crm_session');
        if (!sessionCookie?.value) return null;
        return JSON.parse(sessionCookie.value);
    } catch {
        return null;
    }
}
