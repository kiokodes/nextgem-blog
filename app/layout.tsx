import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: {
    default: 'Blog | NextGem Foundation',
    template: '%s | NextGem Foundation Blog',
  },
  description: 'Updates, impact stories, event coverage and insights from NextGem Foundation and our partner orphanages across Nigeria.',
  icons: {
    icon: 'https://nextgem.sirv.com/assets/favicon.png',
    shortcut: 'https://nextgem.sirv.com/assets/favicon.png',
    apple: 'https://nextgem.sirv.com/assets/favicon.png',
  },
  openGraph: {
    siteName: 'NextGem Foundation',
    url: 'https://blog.nextgemfoundation.com',
    images: [
      {
        url: 'https://nextgem.sirv.com/assets/logo.png',
        width: 1200,
        height: 630,
        alt: 'NextGem Foundation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>{children}</body>
    </html>
  )
}