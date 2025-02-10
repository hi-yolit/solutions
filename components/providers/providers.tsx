import { AuthProvider } from '@/contexts/auth-context'
import { createTheme, MantineProvider } from "@mantine/core";
import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
});


export function Providers({ children }: Readonly<ProvidersProps>) {
  return (
    <MantineProvider>
      <AuthProvider>{children}</AuthProvider>
    </MantineProvider>
  );
}