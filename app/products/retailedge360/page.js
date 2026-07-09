import SiteShell from '@/components/site/SiteShell'
import ProductMarketingPage from '@/components/marketing/ProductMarketingPage'
import { RETAIL_MARKETING } from '@/lib/marketing-content'

export const metadata = {
  title: 'RetailEdge360 — AI Retail Operations & Inventory Intelligence',
  description: RETAIL_MARKETING.tagline,
  openGraph: {
    images: [{ url: '/images/products/retailedge360-dashboard.svg', alt: 'RetailEdge360 Dashboard' }],
  },
}

export default function RetailEdge360MarketingPage() {
  return (
    <SiteShell>
      <ProductMarketingPage product={{ id: 'retailedge360', ...RETAIL_MARKETING }} />
    </SiteShell>
  )
}
