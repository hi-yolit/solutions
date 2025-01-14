'use client'

import { useEffect, useState } from 'react'
import { SubscriptionManagement } from '@/components/account/subscription-management'
import { useAuth } from '@/contexts/auth-context'
import { redirect, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function AdminCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Admin Account</CardTitle>
          <Badge variant="secondary" className="font-medium">
            Admin
          </Badge>
        </div>
        <CardDescription>
          You have full access to all features and content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserCheck className="h-4 w-4" />
          <span>Full admin privileges enabled</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AccountPage() {
  const { user, profile, isLoading, isProfileLoading } = useAuth()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading state while auth is initializing
  if (!mounted || isLoading || isProfileLoading) {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading account details...
              </span>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Redirect if no user or profile after loading
  if (mounted && !isLoading && !isProfileLoading && (!user || !profile)) {
    redirect('/auth/login')
  }

  // TypeScript check
  if (!profile) return null;

  // Get status messages from URL
  const success = searchParams.get('success')
  const error = searchParams.get('error')

  const isAdmin = profile.role === 'ADMIN'

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {success && (
          <Alert className="border border-green-500/50 bg-green-500/10 text-green-700">
            <AlertDescription>
              {success === 'subscription-active' 
                ? 'Your subscription has been activated successfully!'
                : success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error === 'profile-update-failed'
                ? 'Failed to update your subscription. Please try again.'
                : error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Account Settings</h1>
          {isAdmin && (
            <Badge variant="secondary" className="font-medium">
              Admin Account
            </Badge>
          )}
        </div>

        {isAdmin ? (
          <div className="space-y-8">
            <AdminCard />
          </div>
        ) : (
          <SubscriptionManagement profile={profile} />
        )}
      </div>
    </div>
  )
}