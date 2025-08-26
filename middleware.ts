import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes yang membutuhkan autentikasi admin
const protectedRoutes = [
  '/students/new',
  '/students/[id]/edit',
  '/archive'
]

// Routes yang tidak boleh diakses ketika sudah login
const authRoutes = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if user has authentication cookie/header
  // Since we're using localStorage, we'll handle this on client side
  // This middleware mainly handles route redirection logic
  
  // If user is on auth route and already authenticated, redirect to home
  if (authRoutes.includes(pathname)) {
    // We can't check localStorage in middleware, so we'll let the page handle this
    return NextResponse.next()
  }
  
  // For protected routes, let the page component handle authentication
  // The actual auth check will be done in the page components
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
