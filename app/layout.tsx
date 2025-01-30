// app/layout.tsx
import { Providers } from '@/components/providers/providers'
import { Inter } from 'next/font/google'
import "@mantine/core/styles.css";
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

import {
  ColorSchemeScript,
  mantineHtmlProps,
} from "@mantine/core";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}