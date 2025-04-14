// app/api/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Important security check
  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=no_code', request.url)
    )
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) throw error

    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.redirect(
      new URL(`/auth/login?error=auth_failed`, request.url)
    )
  }
}