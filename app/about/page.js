import SiteShell from '@/components/site/SiteShell'
import AboutPagePremium from '@/components/enterprise/AboutPagePremium'
import { MarketingPageCTA } from '@/components/gix/enterprise/MarketingPageHero'
import { COMPANY } from '@/lib/marketing-content'

export const metadata = {
  title: `About — ${COMPANY.name}`,
  description:
    'AsoftechInsightz is an AI-first SaaS company building RetailEdge360, LeadEdge360, and Trinetra360 for Indian businesses and enterprises.',
  openGraph: {
    title: 'About AsoftechInsightz — AI-First SaaS Company',
    description: 'Vision, mission, innovation timeline, and transparent company information.',
  },
}

export default function AboutPage() {
  return (
    <SiteShell>
      <AboutPagePremium />
      <MarketingPageCTA
        title="See our platforms in action"
        description="Book a demo to explore RetailEdge360, LeadEdge360, or Trinetra360 with transparent pricing."
      />
    </SiteShell>
  )
}
