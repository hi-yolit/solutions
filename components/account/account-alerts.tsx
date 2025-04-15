// app/(private)/account/components/account-alerts.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AccountAlerts() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const error = searchParams.get('error')

  return (
    <>
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
    </>
  )
}