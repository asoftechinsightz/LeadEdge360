import SiteShell from '@/components/site/SiteShell'
import MarketingPageHero, { MarketingPageCTA } from '@/components/gix/enterprise/MarketingPageHero'
import { FadeIn, SectionHeader } from '@/components/gix/enterprise/primitives'
import { OUTCOME_SCENARIOS } from '@/lib/marketing-content'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Customer Use Cases — AsoftechInsightz',
  description:
    'Illustrative business scenarios for RetailEdge360, LeadEdge360, and Trinetra360 — no fabricated testimonials or unverified metrics.',
}

export default function CustomersPage() {
  return (
    <SiteShell>
      <MarketingPageHero
        eyebrow="Customers"
        title="Use cases &"
        accent="business scenarios"
        description="We publish attributed customer stories only with explicit permission. Below are illustrative scenarios showing how our platforms solve real problems."
      />

      <section className="container py-20">
        <FadeIn>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100 mb-12">
            We do not display fake client logos, fabricated revenue figures, or invented testimonials. Contact us for reference conversations where available.
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-6">
          {OUTCOME_SCENARIOS.map((s, i) => (
            <FadeIn key={s.scenario} delay={i * 0.06}>
              <div className="gix-glass-dark rounded-2xl border border-white/10 p-6 h-full">
                <p className="text-xs uppercase tracking-widest text-violet-400">{s.industry}</p>
                <h3 className="font-display text-lg font-semibold text-white mt-2">{s.scenario}</h3>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">{s.outcome}</p>
                <p className="text-xs text-slate-500 mt-4 italic border-t border-white/10 pt-3">{s.note}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="container pb-20">
        <FadeIn>
          <SectionHeader
            eyebrow="Next step"
            title="See if our platforms fit your business"
            description="Book a demo for a tailored walkthrough of RetailEdge360, LeadEdge360, or Trinetra360."
            className="text-white [&_p]:text-slate-400"
          />
          <div className="text-center">
            <Link
              href="/book-demo"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white px-8 py-3 text-sm font-medium"
            >
              Book a Demo <ArrowRight className="size-4" />
            </Link>
          </div>
        </FadeIn>
      </section>

      <MarketingPageCTA
        title="Transparent pricing, real products"
        description="Explore our INR subscription plans with clear setup fees — no hidden charges."
      />
    </SiteShell>
  )
}
