import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'


const baseUrl = process.env.NGROK_URL ?? process.env.NEXT_PUBLIC_APP_URL

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  console.log(requestUrl)

  if (!code) {
    console.error('No code provided in callback')
    return NextResponse.redirect(`${baseUrl}/auth/login?error=no_code`)
  }

  const supabase = await createClient()

  try {
    // Log more details for debugging
    console.log('Exchanging code for session', {
      code_length: code.length,
      has_state: Boolean(state)
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth exchange error:', error)
      return NextResponse.redirect(`${baseUrl}/auth/login?error=${encodeURIComponent(error.message)}`)
    }

    console.log('Session created successfully')
    return NextResponse.redirect(`${baseUrl}`)
  } catch (error) {
    console.error('Unexpected auth error:', error)
    return NextResponse.redirect(`${baseUrl}/auth/login?error=unexpected_error`)
  }
}