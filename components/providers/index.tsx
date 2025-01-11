// components/providers/index.tsx
'use client'

import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from '@/components/providers/theme-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}