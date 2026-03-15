import type { Metadata } from 'next'
import { Bebas_Neue, Outfit, Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-editorial',
  display: 'swap',
})

const jost = Jost({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-ui',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ATELIER — Custom Apparel Studio',
  description:
    'A brand-building apparel studio crafting premium custom clothing for forward-thinking companies. We don\'t print clothes. We build identities.',
  keywords: [
    'custom apparel',
    'branded clothing',
    'merch production',
    'corporate wear',
    'embroidery',
    'screen printing',
    'brand identity',
  ],
  openGraph: {
    title: 'ATELIER — Custom Apparel Studio',
    description: 'Premium custom apparel for brands that refuse to blend in.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${outfit.variable} ${cormorant.variable} ${jost.variable}`}>
      <body>{children}</body>
    </html>
  )
}
