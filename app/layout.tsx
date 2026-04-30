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
  openGraph: {
    siteName: 'NextGem Foundation Blog',
    url: 'https://blog.nextgemfoundation.com',
    images: [
      {
        url: 'https://nextgem.sirv.com/assets/logo.png',
        width: 1500,
        height: 700,
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
      <head>
        <link rel="icon" href="https://nextgem.sirv.com/assets/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="https://nextgem.sirv.com/assets/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="https://nextgem.sirv.com/assets/favicon.png" />

        <link rel="preconnect" href="https://6l4myqih.apicdn.sanity.io" />
        <link rel="preconnect" href="https://cdn.sanity.io" />

      </head>
      <body>{children}</body>
    </html>
  )
}

