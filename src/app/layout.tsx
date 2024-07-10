// src/app/layout.tsx

import '@coinbase/onchainkit/styles.css'
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Providers from './providers'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

const WagmiProvider = dynamic(() => import('@/components/WagmiProvider'), { ssr: false })

/**
 * Metadata for the PixelGrid application.
 */
export const metadata: Metadata = {
  title: 'PixelGrid',
  description: 'Conquering the world, one pixel at a time.',
  openGraph: {
    title: 'PixelGrid',
    description: 'Conquering the world, one pixel at a time.',
    url: 'https://pixelgrid.one',
    siteName: 'PixelGrid',
    images: [
      {
        url: 'https://pixelgrid.one/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PixelGrid - Conquering the world, one pixel at a time',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixelGrid',
    description: 'Conquering the world, one pixel at a time.',
    creator: '@PixelGridOnBase',
    images: ['https://pixelgrid.one/twitter-image.png'],
  },
  icons: {
    icon: '/favicon.png',
  },
}

/**
 * Props for the RootLayout component.
 */
interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * RootLayout component that wraps the entire application.
 * @param {RootLayoutProps} props - The props for the RootLayout component.
 * @returns {JSX.Element} The rendered RootLayout component.
 */
export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>PixelGrid</title>
      </head>
      <body>
        <Providers>
          <WagmiProvider>{children}</WagmiProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
