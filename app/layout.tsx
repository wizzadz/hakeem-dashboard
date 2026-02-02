import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hakeem Dashboard',
  description: 'Control tower for Hakeem AI assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--background)]">
        {children}
      </body>
    </html>
  )
}
