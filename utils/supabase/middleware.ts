import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/actions/user'

// Helper functions to determine path types
function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/api/auth/callback' ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth')
  )
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/account') ||
    pathname.startsWith('/home') ||
    pathname.startsWith('/more') ||
    pathname.startsWith('/premium') ||
    pathname.startsWith('/search')
  )
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith('/admin')
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public paths to bypass authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Handle authenticated users
  if (user) {
    // Redirect away from auth pages
    if (pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    // Redirect root to home
    if (pathname === '/') {
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
  else {
    if (isProtectedPath(pathname) || isAdminPath(pathname)) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('returnUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow the request to proceed if no redirects needed
  return NextResponse.next({ request })
}