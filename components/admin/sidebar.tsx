// src/components/admin/sidebar.tsx
"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckSquare,
  FileText,
  Settings,
  BarChart
} from 'lucide-react'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users
  },
  {
    title: 'Resources',
    href: '/admin/resources',
    icon: BookOpen
  },
  {
    title: 'Solutions',
    href: '/admin/solutions',
    icon: FileText
  },
  {
    title: 'Verifications',
    href: '/admin/verifications',
    icon: CheckSquare
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-slate-50/50 h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="px-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-slate-900 transition-all hover:bg-slate-100",
              pathname === item.href && "bg-slate-100"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}