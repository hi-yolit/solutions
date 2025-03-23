import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/actions/user'

// Helper functions to determine path types
function isPublicPath(pathname: string): boolean {
  return (
    pathname === '/api/auth/callback' ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth')
  );
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/account') ||
    pathname.startsWith('/settings') ||
    pathname === '/home'
  );
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow API routes to bypass authentication checks
  if (pathname === '/api/auth/callback' || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Handle authentication-based redirects
  if (user) {
    // For authenticated users
    if (pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    
    // Check admin access
    if (pathname.startsWith('/admin')) {
      try {
        const { profile } = await getProfile(user.id);
        if (profile?.role !== 'ADMIN') {
          return NextResponse.redirect(new URL('/home', request.url));
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    }
  } else {
    // For unauthenticated users
    if (pathname === '/home' || 
        pathname.startsWith('/account') || 
        pathname.startsWith('/settings')) {
      
      const loginUrl = new URL('/auth/login', request.url);
      if (pathname !== '/home') {
        loginUrl.searchParams.set('returnUrl', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // Default: allow the request to proceed
  return NextResponse.next({ request });
}