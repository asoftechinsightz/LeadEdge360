import './globals.css'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['500','600','700'] })

export const metadata = {
  title: 'AsoftechInsightz — AI & Automation SaaS Suite',
  description: 'A Made-in-India AI SaaS Suite. LeadEdge360 for geo-intelligent lead management and RetailEdge360 for AI-powered retail intelligence — unified by a single AI Copilot.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable} dark`}>
      <body className="font-sans">
        {children}
        <Toaster richColors theme="dark" position="top-right" />
      </body>
    </html>
  )
}
