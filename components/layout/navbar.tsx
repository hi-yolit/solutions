// components/layout/navbar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User } from '@supabase/auth-helpers-nextjs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from '@/contexts/auth-context'

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  console.log(user)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleUpgrade = async () => {
    router.push('/upgrade')
  }

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              SA Solutions
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <UserMenu user={user} onSignOut={handleSignOut} onUpgrade={handleUpgrade}/>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Sign up</Button>
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
  onSignOut: () => void
  onUpgrade: () => void
}

function UserMenu({ user, onSignOut, onUpgrade }: UserMenuProps) {


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.full_name ?? user.email ?? ''}
            />
            <AvatarFallback>
              {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <div className="flex items-center gap-4 p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.user_metadata?.avatar_url}
              alt={user.user_metadata?.full_name ?? user.email ?? ''}
            />
            <AvatarFallback>
              {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-medium">
              {user.user_metadata?.full_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            <span className="ms-3 text-sm font-medium">Light mode</span>
          </label>
        </div>

        <DropdownMenuSeparator />

        <div className="space-y-1 p-2">{/* 
          <DropdownMenuItem
            className="cursor-pointer text-muted-foreground"
          >
            Privacy policy
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-muted-foreground"
          >
            Help and feedback
          </DropdownMenuItem> */}
          <DropdownMenuItem
            className="cursor-pointer text-muted-foreground"
            onClick={onUpgrade}
          >
            Upgrade
          </DropdownMenuItem>
        </div>

        <DropdownMenuSeparator />

        <div className="p-2">
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={onSignOut}
          >
            Log out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}