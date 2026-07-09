import SiteShell from '@/components/site/SiteShell'
import ProductMarketingPage from '@/components/marketing/ProductMarketingPage'
import { LEADEDGE_MARKETING } from '@/lib/marketing-content'

export const metadata = {
  title: 'LeadEdge360 — AI Sales, Marketing & Revenue Growth Platform',
  description: LEADEDGE_MARKETING.tagline,
  openGraph: {
    images: [{ url: '/images/products/leadedge360-dashboard.svg', alt: 'LeadEdge360 Dashboard' }],
  },
}

export default function LeadEdge360MarketingPage() {
  return (
    <SiteShell>
      <ProductMarketingPage product={{ id: 'leadedge360', ...LEADEDGE_MARKETING }} />
    </SiteShell>
  )
}
