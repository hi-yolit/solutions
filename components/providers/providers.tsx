// components/providers/providers.tsx
'use client'

import { AuthProvider } from '@/contexts/auth-context'
import { HeroUIProvider } from "@heroui/react";

import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <HeroUIProvider>{children}</HeroUIProvider>
    </AuthProvider>
  );
}