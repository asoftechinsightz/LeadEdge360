import './globals.css'
import Script from 'next/script'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from './providers'
import AnalyticsScripts from '@/components/marketing/AnalyticsScripts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asoftechinsightz.com'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AsoftechInsightz — AI-Powered Business Growth Platform',
    template: '%s | AsoftechInsightz',
  },
  description:
    'Build. Sell. Grow. LeadEdge360 for AI sales & marketing. RetailEdge360 for smart retail. Enterprise SaaS for growing businesses.',
  keywords: ['AI SaaS', 'LeadEdge360', 'RetailEdge360', 'CRM', 'retail POS', 'marketing automation'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'AsoftechInsightz',
    title: 'AsoftechInsightz — Run Your Business with AI',
    description: 'AI-powered SaaS platforms for lead generation, retail operations, and revenue growth.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AsoftechInsightz — AI Business Growth Platform',
    description: 'LeadEdge360 + RetailEdge360 — enterprise AI SaaS',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/images/brand/asoftechinsightz-logo.svg', type: 'image/svg+xml' }],
    apple: '/images/brand/asoftechinsightz-logo.svg',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <AnalyticsScripts />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
        <Toaster richColors theme="light" position="top-right" />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}
