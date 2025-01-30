import { AuthProvider } from '@/contexts/auth-context'
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: Readonly<ProvidersProps>) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}