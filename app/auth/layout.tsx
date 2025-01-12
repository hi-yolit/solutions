// app/auth/layout.tsx
'use client'

import { useEffect, useState } from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted on client
  if (!mounted) {
    return null
  }

  return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
          {/* Left side - Content */}
          <div className="flex items-center justify-center p-8">
            <div className="w-full max-w-sm space-y-6">
              {children}
            </div>
          </div>

          {/* Right side - Hero Image */}
          <div className="hidden md:block relative bg-muted">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted-foreground/20" />
            <div className="absolute inset-0 flex flex-col justify-center p-12">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-foreground/80">
                  Find textbook solutions you can trust
                </h1>
                <p className="text-lg text-muted-foreground">
                  Access step-by-step solutions for your textbooks and past papers
                </p>
              </div>
            </div>
          </div>
        </div>
  )
}