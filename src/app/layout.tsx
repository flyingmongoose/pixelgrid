import '@coinbase/onchainkit/styles.css'
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css'
import type { Metadata } from 'next'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
