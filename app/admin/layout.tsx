// src/app/admin/layout.tsx
"use client"
import "../globals.css";
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Users, BookOpen } from "lucide-react"
import 'katex/dist/katex.min.css'

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
    color: "text-sky-500",
  },
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.variable} antialiased`}>
        <div className="h-full relative">
          <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 border-r bg-background">
            <div className="space-y-4 py-4 flex flex-col h-full">
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
            </div>
          </div>
          <main className="md:pl-72 h-full">{children}</main>
        </div>
      </body>
    </html>
  );
}