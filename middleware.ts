import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes
  const publicRoutes = ['/', '/login', '/signup', '/charities'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/auth');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes - check for auth token
  const token = request.headers.get('authorization')?.split(' ')[1] || 
                request.cookies.get('authToken')?.value;

  if (!token) {
    // Redirect to login if accessing protected route
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Verify token
  try {
    const payload = await verifyToken(token);
    if (!payload) {
      throw new Error('Invalid token');
    }

    // Check admin routes
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - admin access required' },
        { status: 403 }
      );
    }

    // Pass user info to route handlers via headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
