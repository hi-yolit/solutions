// app/admin/layout.tsx
"use client"

import "../globals.css";
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Users, BookOpen, LogOut, Globe } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import 'katex/dist/katex.min.css'
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/toaster";


const routes = [
  {
    label: 'Users',
    icon: Users,
    href: '/admin/users',
    color: "text-violet-500",
  },
  {
    label: 'Resources',
    icon: BookOpen,
    href: '/admin/resources',
    color: "text-pink-500",
  },
]

const getUserDisplayInfo = (user: User | null) => {
  const fallbackName = "Admin User";
  const fallbackInitial = "U";
  return {
    displayName: user?.user_metadata?.full_name || fallbackName,
    initial:
      user?.user_metadata?.full_name?.[0] ||
      user?.email?.[0]?.toUpperCase() ||
      fallbackInitial,
    avatarUrl: user?.user_metadata?.avatar_url,
    email: user?.email,
  };
}; 

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuth()

  const handleSeeWebsite = () => {
    router.push('/')
  }

  return (
    <div className="h-full relative">
      <NextTopLoader />
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 border-r bg-background">
        <div className="flex flex-col h-full">
          <div className="px-3 py-2 flex-1">
            <Link href="/admin" className="flex items-center pl-3 mb-14">
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </Link>
            <div className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-lg transition",
                    pathname === route.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center flex-1">
                    <route.icon className="h-5 w-5 mr-3" />
                    {route.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* User Profile Section */}
          <div className="border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start px-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.user_metadata?.avatar_url}
                        alt={getUserDisplayInfo(user).initial}
                      />
                      <AvatarFallback>
                        {getUserDisplayInfo(user).initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 text-left">
                      <p className="text-sm font-medium line-clamp-1">
                        {getUserDisplayInfo(user).displayName}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[240px]">
                <div className="flex items-center gap-4 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url}
                      alt={user?.user_metadata?.full_name ?? user?.email ?? ""}
                    />
                    <AvatarFallback>
                      {user?.user_metadata?.full_name?.[0] ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">
                      {user?.user_metadata?.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="p-2">
                  <DropdownMenuItem
                    className="text-muted-foreground cursor-pointer"
                    onClick={handleSeeWebsite}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    See Website
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <main className="md:pl-72 h-full">{children}</main>
      <Toaster />
    </div>
  );
}