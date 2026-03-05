import { NextResponse } from 'next/server';

export function middleware(request) {
    const session = request.cookies.get('crm_session');
    const { pathname } = request.nextUrl;

    // console.log(`Middleware tracing: ${pathname} | Session: ${session ? 'Exists' : 'Missing'}`);

    // 1. Define public routes that don't need authentication
    const isPublicRoute =
        pathname.startsWith('/login') ||
        pathname.startsWith('/api/auth');

    // 2. Allow access to public routes and internal Next.js assets
    if (
        isPublicRoute ||
        pathname.startsWith('/_next') ||
        pathname.includes('.') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // 3. Redirect to /login if no session exists for private routes
    if (!session) {
        // console.log(`Redirecting unauthorized access to ${pathname} -> /login`);
        const loginUrl = new URL('/login', request.url);
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
