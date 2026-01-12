// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import { ApiErrorHandler } from '@/components/errors/ApiErrorHandler'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MemoBot - Recherche de sujets',
  description: 'Plateforme intelligente de recherche de sujets académiques',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ApiErrorHandler>
            <Toaster position="top-right" />
            {children}
          </ApiErrorHandler>
        </Providers>
      </body>
    </html>
  )
}