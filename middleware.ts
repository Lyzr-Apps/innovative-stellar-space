import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to inject build error detector script.
 *
 * Note: This middleware runs on the edge and can't modify HTML response body.
 * It only sets headers. The script must be loaded via layout.tsx Script component.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Allow iframe embedding
  response.headers.set('X-Frame-Options', 'ALLOWALL')
  response.headers.set('Content-Security-Policy', "frame-ancestors *")

  return response
}

// Run middleware on all routes
export const config = {
  matcher: '/:path*',
}
