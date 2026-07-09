'use client'

import { useSearchParams } from 'next/navigation'
import SiteShell from '@/components/site/SiteShell'
import MarketingPageHero from '@/components/gix/enterprise/MarketingPageHero'
import MarketingLeadForm from '@/components/marketing/MarketingLeadForm'
import { FadeIn } from '@/components/gix/enterprise/primitives'
import { CALENDLY_URL } from '@/lib/marketing-content'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

export default function BookDemoClient() {
  const searchParams = useSearchParams()
  const product = searchParams.get('product') || ''

  return (
    <SiteShell>
      <MarketingPageHero
        eyebrow="Book Demo"
        title="See our AI platforms"
        accent="in action"
        description="Schedule a personalized walkthrough of LeadEdge360, RetailEdge360, or both — every request is tracked in our CRM."
        ctaHref={CALENDLY_URL}
        ctaLabel="Open Calendly"
      />

      <section className="container pb-24 grid lg:grid-cols-2 gap-10">
        <FadeIn>
          <MarketingLeadForm
            source="book-demo"
            product={product}
            title="Request a demo"
            description="Tell us about your business and we'll tailor the session."
            fields={['name', 'email', 'company', 'phone', 'industry', 'message']}
            submitLabel="Book Free Demo"
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="gix-glass rounded-2xl border border-white/10 p-8 h-full">
            <h3 className="font-display text-xl font-bold">Prefer to pick a time?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Use our Calendly link for instant scheduling with the sales team.
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-[hsl(var(--brand-electric))] hover:underline"
            >
              <Calendar className="size-4" />
              Schedule on Calendly
            </a>
            <div className="mt-10 pt-8 border-t border-white/10 text-sm text-muted-foreground space-y-2">
              <p>Or explore:</p>
              <Link href="/products/leadedge360" className="block hover:text-[hsl(var(--brand-electric))]">LeadEdge360 product tour →</Link>
              <Link href="/products/retailedge360" className="block hover:text-[hsl(var(--brand-electric))]">RetailEdge360 product tour →</Link>
              <Link href="/growth-audit" className="block hover:text-[hsl(var(--brand-electric))]">Free growth assessment →</Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </SiteShell>
  )
}
