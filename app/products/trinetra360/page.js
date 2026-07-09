import SiteShell from '@/components/site/SiteShell'
import TrinetraMarketingPage from '@/components/marketing/TrinetraMarketingPage'
import { TRINETRA_MARKETING } from '@/lib/marketing-content'

export const metadata = {
  title: 'Trinetra360 — Enterprise Observability & AIOps',
  description: TRINETRA_MARKETING.message + ' ' + TRINETRA_MARKETING.tagline,
  openGraph: {
    title: 'Trinetra360 — Observe everything. Predict issues. Resolve faster.',
    description: TRINETRA_MARKETING.tagline,
  },
}

export default function Trinetra360Page() {
  return (
    <SiteShell>
      <TrinetraMarketingPage />
    </SiteShell>
  )
}
