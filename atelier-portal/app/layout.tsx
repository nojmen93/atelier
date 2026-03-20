import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Atelier — Buyer Portal',
    template: '%s — Atelier',
  },
  description: 'B2B buyer portal for Atelier',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: '#171717',
              border: '1px solid #262626',
              color: '#f5f5f0',
            },
          }}
        />
      </body>
    </html>
  )
}
