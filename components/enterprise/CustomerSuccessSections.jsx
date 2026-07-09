'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn, GlassCard, SectionHeader } from '@/components/gix/enterprise/primitives'

export default function CustomerSuccessSections({ page }) {
  return (
    <>
      <section className="py-20 border-t border-border/60">
        <div className="container">
          <FadeIn>
            <SectionHeader eyebrow="Case studies" title="Before and after" description="Measurable impact from LeadEdge360 and RetailEdge360 deployments." />
          </FadeIn>
          <div className="space-y-8">
            {page.caseStudies.map((cs, i) => (
              <FadeIn key={cs.company} delay={i * 0.06}>
                <GlassCard className="p-8 md:p-10">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="text-xs px-3 py-1 rounded-full bg-white">{cs.industry}</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-[#0066FF]/20 text-[hsl(var(--brand-electric))]">{cs.product}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold">{cs.company}</h3>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <p className="text-xs uppercase tracking-wider text-rose-600 mb-2">Before</p>
                      <p className="text-sm text-muted-foreground">{cs.before}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs uppercase tracking-wider text-emerald-600 mb-2">After</p>
                      <p className="text-sm text-muted-foreground">{cs.after}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-6">
                    {cs.metrics.map((m) => (
                      <span key={m} className="text-sm font-semibold gradient-text">{m}</span>
                    ))}
                  </div>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <FadeIn>
            <SectionHeader eyebrow="Testimonials" title="What leaders say" />
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            {page.testimonials.map((t, i) => (
              <FadeIn key={t.author} delay={i * 0.05}>
                <GlassCard className="p-6 h-full">
                  <p className="leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <p className="text-sm text-muted-foreground mt-4">— {t.author}, {t.company}</p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/60 bg-secondary/50">
        <div className="container">
          <FadeIn>
            <SectionHeader eyebrow="Adoption" title="Customer journey lifecycle" />
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {page.adoptionLifecycle.map((phase, i) => (
              <FadeIn key={phase.phase} delay={i * 0.05}>
                <GlassCard className="p-6 text-center h-full">
                  <p className="text-xs text-[hsl(var(--brand-electric))] uppercase tracking-widest">Step {i + 1}</p>
                  <h3 className="font-semibold text-lg mt-2">{phase.phase}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{phase.desc}</p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <FadeIn>
            <SectionHeader eyebrow="Enterprise trust" title="Built for regulated teams" />
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {page.enterpriseTrust.map((item) => (
              <GlassCard key={item} className="p-4 text-sm text-center">{item}</GlassCard>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild className="rounded-full bg-[#0066FF] hover:bg-[#00C6FF]">
              <Link href="/growth-audit">Calculate your ROI <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
