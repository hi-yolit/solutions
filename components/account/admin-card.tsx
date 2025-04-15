// app/(private)/account/components/admin-card.tsx
'use client'

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserCheck } from "lucide-react"

export function AdminCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Admin Account</CardTitle>
          <Badge variant="secondary" className="font-medium">Admin</Badge>
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