// app/(private)/account/page.tsx
"use client"
import { Suspense, useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '@/contexts/auth-context'
import { AdminCard } from '@/components/account/admin-card'
import { ProfileSettings } from '@/components/account/profile-settings'
import { SubscriptionManagement } from '@/components/account/subscription-management'
import { AccountAlerts } from '@/components/account/account-alerts'

export default function AccountPage() {
  const { user, profile, isLoading, isProfileLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (mounted && !isLoading && !isProfileLoading && (!user || !profile)) {
    redirect('/auth/login')
  }

  if (!profile) return null

  const isAdmin = profile.role === 'ADMIN'

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <Suspense fallback={null}>
          <AccountAlerts />
        </Suspense>

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
            <ProfileSettings profile={profile} />
          </div>
        ) : (
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileSettings profile={profile} />
            </TabsContent>

            <TabsContent value="subscription">
              <SubscriptionManagement profile={profile} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}