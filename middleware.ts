import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    
    // Auth pages
    const isClientLogin = req.nextUrl.pathname === '/login';
    const isAdminLogin = req.nextUrl.pathname === '/panel/login';
    const isRegister = req.nextUrl.pathname === '/register';
    const isAuthPage = isClientLogin || isAdminLogin || isRegister;

    if (isAuthPage) {
      if (isAuth) {
        if (token.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/panel', req.url));
        }
        if (token.role === 'USER' && !isAdminLogin) {
          return NextResponse.redirect(new URL('/', req.url));
        }
        if (token.role === 'NEW_USER' && !isRegister) {
          return NextResponse.redirect(new URL('/register', req.url));
        }
        if (token.role !== 'NEW_USER' && isRegister) {
            return NextResponse.redirect(new URL('/', req.url));
        }
      }
      return null;
    }

    // Unauthenticated access
    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      if (req.nextUrl.pathname.startsWith('/panel')) {
        return NextResponse.redirect(
          new URL(`/panel/login?from=${encodeURIComponent(from)}`, req.url)
        );
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Authenticated but wrong role
    if (req.nextUrl.pathname.startsWith('/panel') && token?.role !== 'ADMIN') {
      // If non-admin tries to access admin panel, kick them back to panel login with error
      const response = NextResponse.redirect(new URL('/panel/login?error=AccessDenied', req.url));
      response.cookies.delete('next-auth.session-token');
      response.cookies.delete('__Secure-next-auth.session-token');
      return response;
    }

    // User protected routes
    const protectedUserRoutes = ['/profil', '/tiket', '/checkout'];
    const isProtectedRoute = protectedUserRoutes.some((route) => req.nextUrl.pathname.startsWith(route));

    if (isProtectedRoute) {
        if (token?.role === 'NEW_USER') {
            return NextResponse.redirect(new URL('/register', req.url));
        }
        if (token?.role !== 'USER') {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    // General app routes for NEW_USER must redirect to register
    if (token?.role === 'NEW_USER') {
        return NextResponse.redirect(new URL('/register', req.url));
    }

    return null;
  },
  {
    callbacks: {
      authorized: () => true, // We handle authorization logic inside
    },
  }
);

export const config = {
  matcher: [
    '/panel/:path*',
    '/profil/:path*',
    '/tiket/:path*',
    '/checkout/:path*',
    '/login',
    '/register'
  ],
};
