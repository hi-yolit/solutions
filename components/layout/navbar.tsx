// src/components/layout/navbar.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <Link href="/" className="text-xl font-bold">
              SA Solutions
            </Link>
          </div>
          
          <div className="flex gap-4">
            <Link href="/subjects">
              <Button variant="ghost">Subjects</Button>
            </Link>
            <Link href="/resources">
              <Button variant="ghost">Resources</Button>
            </Link>
            <Link href="/auth/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}