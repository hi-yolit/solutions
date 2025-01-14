import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getProfile } from '@/actions/user'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define paths that should bypass middleware checks
  const isCallbackPath = request.nextUrl.pathname === '/api/auth/callback';
  const isApiPath = request.nextUrl.pathname.startsWith('/api');
  const isAuthPath = request.nextUrl.pathname.startsWith('/auth');
  
  // Define protected paths that require authentication
  const isAccountPath = request.nextUrl.pathname.startsWith('/account');
  const isSettingsPath = request.nextUrl.pathname.startsWith('/settings');

  // Allow callback and API routes
  if (isCallbackPath || isApiPath) {
    return NextResponse.next();
  }

  // Redirect to home if authenticated user tries to access auth pages
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect unauthenticated users trying to access protected routes
  const protectedPaths = isAccountPath || isSettingsPath;
  if (!user && protectedPaths) {
    const returnUrl = request.nextUrl.pathname;
    const loginUrl = new URL('/auth/login', request.url);
    if (returnUrl !== '/') {
      loginUrl.searchParams.set('returnUrl', returnUrl);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Fetch the user's role if authenticated
  let profileRole = null;
  if (user) {
    try {
      const { profile, error } = await getProfile(user.id);

      if (error) {
        console.error('Failed to fetch profile:', error);
        // Let the user pass for now if the profile fetch fails
        return NextResponse.next();
      }

      profileRole = profile?.role;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return NextResponse.next(); // Prevent redirect loops on profile fetch failure
    }
  }

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin') && profileRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Return the default response if no conditions match
  return supabaseResponse;
}