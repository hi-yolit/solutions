import { AuthProvider } from '@/contexts/auth-context'
import { MantineProvider } from "@mantine/core";
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: Readonly<ProvidersProps>) {
  return (
    <MantineProvider>
      <AuthProvider>{children}</AuthProvider>
    </MantineProvider>
  );
}