import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Configure protected routes
const protectedPaths = [
  '/content/nikosona/new',
  '/content/nikosona/edit',
  '/upload',
  '/api/upload',
  '/api/posts',
  '/juicey/edit'    // Only protect the edit page, not the view page
];

// Configure public API paths that should bypass CSRF
const publicApiPaths = [
  '/api/auth',
  '/api/mood',
  '/api/mood/auth',  // Add this line
  '/api/weather'
];

export async function middleware(request) {
  // Skip middleware for WebSocket connections and static files
  if (
    request.headers.get("upgrade") === "websocket" ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Get the token from the session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Handle protected routes
  if (protectedPaths.some(prefix => path.startsWith(prefix))) {
    if (!token) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  // Add CORS headers
  const response = NextResponse.next();
  
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    return response;
  }

  // Add security headers to all responses
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Only add CSP header for non-API routes to avoid blocking necessary API functionality
  if (!path.startsWith('/api/')) {
    response.headers.set(
      'Content-Security-Policy',
      `
        default-src 'self';
        script-src 'self' 'unsafe-eval' 'unsafe-inline';
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data: *.cloudinary.com;
        font-src 'self';
        connect-src 'self' *.cloudinary.com;
        media-src 'self' *.cloudinary.com;
        frame-ancestors 'none';
      `.replace(/\s+/g, ' ').trim()
    );
  }

  // Rate limiting headers for API routes
  if (path.startsWith('/api/') && !publicApiPaths.some(p => path.startsWith(p))) {
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99'); // This should be dynamic in production
  }

  return response;
}

// Update config to exclude WebSocket and development paths
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|webpack-hmr|on-demand-entries-ping).*)',
  ],
};
