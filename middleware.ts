import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Validates an authentication token
 * In a real application, this would verify JWT signatures, check expiration, etc.
 */
function validateToken(token: string | undefined): boolean {
  if (!token) return false

  // For our mock implementation, we just check if it starts with our prefix
  // In a real app, you would verify JWT signatures, check expiration, etc.
  return token.startsWith("mock-token-")
}

// Define which routes require authentication
const protectedRoutes = ["/dashboard", "/profile", "/categories"]

// Define which routes are only accessible for non-authenticated users
const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"]

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname

  // Check if there's an auth token in cookies
  const authToken = request.cookies.get("wellness_auth_token")?.value
  const isAuthenticated = validateToken(authToken)

  // If the route requires authentication and user is not authenticated
  if (protectedRoutes.some((route) => currentPath.startsWith(route)) && !isAuthenticated) {
    const url = new URL("/login", request.url)
    url.searchParams.set("from", currentPath)
    return NextResponse.redirect(url)
  }

  // If the route is for non-authenticated users and user is authenticated
  if (authRoutes.some((route) => currentPath.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If the user is authenticated and tries to access the root path
  if (currentPath === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
