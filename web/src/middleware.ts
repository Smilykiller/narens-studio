import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const mockRole = request.cookies.get("mock_role")?.value
  const isMockUser = !!mockRole
  const isAdmin = mockRole === "admin"

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/admin') || 
    request.nextUrl.pathname.startsWith('/selection') || 
    request.nextUrl.pathname.startsWith('/live') || 
    isDashboardRoute

  // If not logged in and hitting a protected route
  if (isProtectedRoute && !isMockUser) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admins shouldn't be on /dashboard, redirect to /admin/portfolio
  if (isDashboardRoute && isAdmin) {
    return NextResponse.redirect(new URL('/admin/portfolio', request.url))
  }

  // Logged-in users hitting /login should be redirected to their respective homes
  if (isAuthRoute && isMockUser) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/portfolio', request.url))
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
