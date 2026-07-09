import SiteShell from '@/components/site/SiteShell'
import GIXContainer from '@/components/gix/layout/GIXContainer'

import CinematicHeroSection from '@/components/gix/sections/enterprise/CinematicHeroSection'
import ProductEcosystemPremiumSection from '@/components/gix/sections/enterprise/ProductEcosystemPremiumSection'
import GrowthJourneyFlowSection from '@/components/gix/sections/enterprise/GrowthJourneyFlowSection'
import SuiteVsEnterpriseSection from '@/components/gix/sections/enterprise/SuiteVsEnterpriseSection'
import StartupIndiaSection from '@/components/gix/sections/enterprise/StartupIndiaSection'
import PlatformValueSection from '@/components/gix/sections/enterprise/PlatformValueSection'
import IndustriesTrustStrip from '@/components/gix/sections/enterprise/IndustriesTrustStrip'
import PricingTeaserSection from '@/components/gix/sections/enterprise/PricingTeaserSection'
import TrustSignalsSection from '@/components/gix/sections/enterprise/TrustSignalsSection'
import EnterpriseCTASection from '@/components/gix/sections/enterprise/EnterpriseCTASection'
import StructuredData from '@/components/marketing/StructuredData'
import { FAQSection } from '@/components/enterprise/sections'
import { DEFAULT_FAQ } from '@/lib/enterprise-pages'
import { COMPANY, HERO } from '@/lib/marketing-content'

export const metadata = {
  title: `${COMPANY.name} — ${COMPANY.tagline}`,
  description: HERO.subheadline,
  openGraph: {
    title: `${COMPANY.name} — AI, Automation & Enterprise Intelligence`,
    description: HERO.subheadline,
    type: 'website',
    url: 'https://asoftechinsightz.com',
    images: [{ url: '/images/products/leadedge360-dashboard.svg', width: 1400, height: 900, alt: 'LeadEdge360 Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${COMPANY.name} — Enterprise AI SaaS`,
    description: HERO.subheadline,
  },
}

export default function Home() {
  return (
    <SiteShell>
      <StructuredData type="organization" />
      <StructuredData type="software" />
      <GIXContainer>
        <CinematicHeroSection />
        <ProductEcosystemPremiumSection />
        <GrowthJourneyFlowSection />
        <SuiteVsEnterpriseSection />
        <PlatformValueSection />
        <IndustriesTrustStrip />
        <PricingTeaserSection />
        <StartupIndiaSection />
        <TrustSignalsSection />
        <FAQSection faq={DEFAULT_FAQ} />
        <EnterpriseCTASection />
      </GIXContainer>
    </SiteShell>
  )
}
