import { NextResponse } from 'next/server';

export function proxy(request) {
    const session = request.cookies.get('crm_session');
    const { pathname } = request.nextUrl;

    // console.log(`Middleware tracing: ${pathname} | Session: ${session ? 'Exists' : 'Missing'}`);

    // 1. Define public routes (landing, signup, login)
    const isPublicRoute =
        pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/debug-env');

    // 2. Allow access to public routes and internal Next.js assets
    if (
        isPublicRoute ||
        pathname.startsWith('/_next') ||
        pathname.includes('.') ||
        pathname === '/favicon.ico'
    ) {
        // / always shows landing page (no redirect to dashboard)
        return NextResponse.next();
    }

    // 3. Redirect to /login if no session exists for private routes
    if (!session) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Skip all API routes except for the ones we want to protect (if any)
         * In this case, we protect everything except the public routes defined above.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
