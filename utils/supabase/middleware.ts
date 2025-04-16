import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/actions/user'

// Public paths (accessible to all)
function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/exercises' ||
    pathname === '/explore' ||
    pathname === '/pricing' ||
    pathname === '/resources' ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth')
  )
}

// Protected user routes (require authentication)
function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/account') ||
    pathname.startsWith('/home') ||
    pathname.startsWith('/more') ||
    pathname.startsWith('/premium') ||
    pathname.startsWith('/search')
  )
}

// Admin routes (require admin role)
function isAdminPath(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check public paths first
  if (isPublicPath(pathname)) {
    // Allow access to public paths for all users
    return NextResponse.next()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Handle authenticated users
  if (user) {
    // Redirect root path to home dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    // Redirect away from auth pages
    if (pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    // Admin route protection
    if (isAdminPath(pathname)) {
      try {
        const { profile } = await getProfile(user.id)
        if (profile?.role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/home', request.url))
        }
      } catch (err) {
        console.error('Error fetching user profile:', err)
        return NextResponse.redirect(new URL('/home', request.url))
      }
    }
  }
  // Handle unauthenticated users
  else if (isProtectedPath(pathname) || isAdminPath(pathname)) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

  return NextResponse.next({ request })
}