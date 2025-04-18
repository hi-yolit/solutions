'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { User } from '@supabase/supabase-js'
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from '@/contexts/auth-context'
import { Loader2, School, GraduationCap, ArrowLeft, Coins } from 'lucide-react'
import { ProfileWithMetadata } from '@/types/user'
import { useMemo } from "react";
import { Badge } from '@/components/ui/badge'

export function Navbar() {
  const { user, profile, signOut, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Check if current path is home or landing page
  const isHomePage = pathname === '/' || pathname === '/home'

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
    router.push('/auth/login')
  }

  const handleUpgrade = () => {
    router.push('/account')
  }

  const handleBack = () => {
    router.back()
  }

  // Credits indicator
  const renderCreditsIndicator = () => {
    if (!profile || isLoading || profile.subscriptionStatus === 'ACTIVE') {
      return null;
    }

    return (
      <Link href="/account" className="hover:opacity-80 transition-opacity">
        <Badge
          className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
        >
          <Coins className="h-3 w-3" />
          <span className="text-xs font-medium">
            {profile.solutionCredits}
          </span>
        </Badge>
      </Link>
    );
  };

  return (
    <nav className="border-b bg-background fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {isHomePage ? (
            // Logo section for home/landing pages
            <div className="flex-shrink-0 flex items-center space-x-2">
              <Link
                href="https://yolit.co.za/"
                className="flex-shrink-0"
                target="_blank"
                rel="noopener noreferrer"
              >
                {/* Full logo for medium screens and up */}
                <div className="hidden md:block">
                  <Image src="/YAAS_logo.svg" alt="YAAS Logo" width={100} height={24} priority />
                </div>
                {/* Symbol-only logo for mobile */}
                <div className="block md:hidden">
                  <Image src="/YAAS_logo_symbol.svg" alt="YAAS Logo" width={32} height={32} priority />
                </div>
              </Link>
              <span className="md:inline">/</span>
              <Link href="/" className="md:inline font-medium">
                Explanations
              </Link>
            </div>
          ) : (
            // Back button for other pages
            <div className="flex-shrink-0">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-2 hover:text-primary"
                aria-label={user ? "Back to home" : "Back to landing page"}
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                <span className="hidden sm:inline">Back</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Credits indicator */}
            {renderCreditsIndicator()}

            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : user ? (
              <UserMenu user={user} profile={profile} onSignOut={handleSignOut} onUpgrade={handleUpgrade} />
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login">
                  <Button>Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

interface UserMenuProps {
  user: User
  profile: ProfileWithMetadata | null
  onSignOut: () => void
  onUpgrade: () => void
}

function UserMenu({ user, profile, onSignOut, onUpgrade }: UserMenuProps) {

  return useMemo(
    () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.user_metadata?.avatar_url}
                alt={user.user_metadata?.full_name ?? user.email ?? ""}
              />
              <AvatarFallback>
                {user.user_metadata?.full_name?.[0] ||
                  user.email?.[0]?.toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage
                  src={user.user_metadata?.avatar_url}
                  alt={user.user_metadata?.full_name ?? user.email ?? ""}
                />
                <AvatarFallback>
                  {user.user_metadata?.full_name?.[0] ||
                    user.email?.[0]?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {profile && (
            <>
              <div className="space-y-2 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <School className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{profile.school || "No school set"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4 flex-shrink-0" />
                  <span>Grade {profile.grade || "not set"}</span>
                </div>

                {/* Show subscription status when not active */}
                {profile.subscriptionStatus !== 'ACTIVE' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Coins className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {profile.solutionCredits > 0
                        ? `${profile.solutionCredits} credit${profile.solutionCredits !== 1 ? 's' : ''} left`
                        : 'No credits left'}
                    </span>
                  </div>
                )}
              </div>

              <DropdownMenuSeparator />

              {profile.role === "ADMIN" && (
                <>
                  <div className="p-2">
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer">
                        Admin Dashboard
                      </DropdownMenuItem>
                    </Link>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
            </>
          )}

          <div className="p-2">
            <DropdownMenuItem
              className="cursor-pointer text-muted-foreground"
              onClick={onUpgrade}
            >
              Account
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={onSignOut}
            >
              Log out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [user, profile, onSignOut, onUpgrade]
  );
}