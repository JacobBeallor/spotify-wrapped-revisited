import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Spotify Wrapped 2.0',
  description: 'Interactive visualization of personal Spotify streaming history',
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
        <Script 
          src="https://open.spotify.com/embed/iframe-api/v1" 
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}

