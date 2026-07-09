'use client'

import { usePathname } from 'next/navigation'
import { ThemeProvider } from '@/components/design-system/themes/ThemeProvider'
import { isMarketingPath } from '@/lib/marketing-routes'
import Navbar from './Navbar'
import Footer from './Footer'
import DpdpConsentBanner from './DpdpConsentBanner'
import MarketingWidgets from '@/components/marketing/MarketingWidgets'

export default function SiteShell({ children }) {
  const pathname = usePathname()
  const enterprise = isMarketingPath(pathname)

  return (
    <ThemeProvider theme="marketing" className={`min-h-screen flex flex-col ${enterprise ? 'gix-premium-dark' : ''}`}>
      <Navbar />
      <main className={`flex-1 ${enterprise ? 'gix-marketing-content relative' : ''}`}>
        {enterprise && (
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#0066FF]/[0.06] blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-[#8B5CF6]/[0.05] blur-[100px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00C6FF]/[0.03] blur-[140px] rounded-full" />
          </div>
        )}
        <div className={enterprise ? 'relative z-10' : undefined}>{children}</div>
      </main>
      <Footer />
      <MarketingWidgets />
      <DpdpConsentBanner />
    </ThemeProvider>
  )
}
