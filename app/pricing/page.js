import SiteShell from '@/components/site/SiteShell'
import MarketingPageHero, { MarketingPageCTA } from '@/components/gix/enterprise/MarketingPageHero'
import PricingShowcase from '@/components/marketing/PricingShowcase'
import Link from 'next/link'
import { COMPANY } from '@/lib/marketing-content'

export const metadata = {
  title: `Pricing — ${COMPANY.name}`,
  description:
    'RetailEdge360 from ₹2,999/month, LeadEdge360 from ₹14,999/month, and Business Suite from ₹16,999/month. Trinetra360 enterprise observability is sold separately.',
}

export default function PricingPage() {
  return (
    <SiteShell>
      <MarketingPageHero
        eyebrow="Pricing"
        title="Simple, transparent plans"
        accent="built for Indian SMEs"
        description="Affordable monthly plans in INR with one-time setup options. Business Suite from ₹16,999/month. Trinetra360 enterprise pricing is separate."
      />

      <section className="container pb-24">
        <PricingShowcase />
        <p className="max-w-2xl mx-auto mt-12 text-center text-sm text-slate-400">
          Already a customer?{' '}
          <Link href="/signin" className="text-cyan-400 hover:underline">Sign in</Link>
          {' '}to manage billing, or contact{' '}
          <a href={`mailto:${COMPANY.email}`} className="text-cyan-400 hover:underline">{COMPANY.email}</a>
          {' '}for enterprise quotes.
        </p>
      </section>

      <MarketingPageCTA
        title="Not sure which plan fits?"
        description="Book a free consultation — we'll recommend RetailEdge360, LeadEdge360, or a bundle based on your business."
      />
    </SiteShell>
  )
}
