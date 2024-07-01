import '@coinbase/onchainkit/styles.css'
import '@rainbow-me/rainbowkit/styles.css';
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PixelGrid',
  description: 'Conquering the world, one pixel at a time.',
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
