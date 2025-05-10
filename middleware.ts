import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the session cookie
  const sessionCookie = request.cookies.get("tmdb_session")

  // For protected routes, redirect to login if no session
  // Example: if (request.nextUrl.pathname.startsWith('/account') && !sessionCookie) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  // For now, we'll just pass through all requests
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
