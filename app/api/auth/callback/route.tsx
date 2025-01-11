// app/api/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        throw error
      }
    }

    // Redirect back to your application
    return NextResponse.redirect(new URL('/', requestUrl.origin))
  } catch (error) {
    console.error('Auth callback error:', error)
    // Redirect to login page with error
    return NextResponse.redirect(
      new URL('/auth/login?error=auth', request.url)
    )
  }
}