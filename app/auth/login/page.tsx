'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { Loader2, Chrome, Facebook, ArrowLeft } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isFacebookLoading, setIsFacebookLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    if (error) {
      console.error('OAuth Error:', { error, description: errorDescription })
      setError(errorDescription || error)
    }
  }, [searchParams])

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    const setLoading = provider === 'google' ? setIsGoogleLoading : setIsFacebookLoading

    try {
      setLoading(true)
      setError(null)

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
        }
      })

      if (authError) throw authError

    } catch (error) {
      console.error('OAuth error:', error)
      setError(`Failed to sign in with ${provider}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        <h1 className="text-2xl font-bold">Sign in or create an account</h1>
        <p className="text-sm text-muted-foreground">
          Continue with your social provider
        </p>
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthLogin('google')}
          disabled={isGoogleLoading || isFacebookLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="mr-2 h-4 w-4" />
          )}
          Continue with Google
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthLogin('facebook')}
          disabled={isFacebookLoading || isGoogleLoading}
        >
          {isFacebookLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Facebook className="mr-2 h-4 w-4" />
          )}
          Continue with Facebook
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">
              Using a social provider will automatically create an account, if you don&apos;t have one yet
            </span>
          </div>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}