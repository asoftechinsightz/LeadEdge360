'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn, GlassCard, SectionHeader } from '@/components/gix/enterprise/primitives'

export default function IndustryProfilesSection({ industries }) {
  if (!industries?.length) return null
  return (
    <section className="py-12 border-t border-border/60">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="By industry"
            title="Deep vertical playbooks"
            description="Each industry includes challenges, AI solutions, workflows, integrations, ROI, and outcomes."
          />
        </FadeIn>
        <div className="space-y-16">
          {industries.map((ind, i) => (
            <FadeIn key={ind.id} delay={i * 0.05}>
              <article id={ind.id} className="scroll-mt-24">
                <GlassCard className="p-8 md:p-10 gix-glow">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[hsl(var(--brand-electric))]">{ind.product}</p>
                      <h2 className="font-display text-2xl md:text-3xl font-bold mt-1">{ind.name}</h2>
                    </div>
                    <Button asChild variant="outline" className="rounded-full border-border">
                      <Link href={ind.productHref}>Explore {ind.product} <ArrowRight className="ml-2 size-4" /></Link>
                    </Button>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold mb-3">Business challenges</h3>
                      <ul className="space-y-2">
                        {ind.challenges.map((c) => (
                          <li key={c} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-rose-400">•</span> {c}
                          </li>
                        ))}
                      </ul>
                      <h3 className="font-semibold mt-6 mb-3">AI solutions</h3>
                      <ul className="space-y-2">
                        {ind.aiSolutions.map((s) => (
                          <li key={s} className="text-sm text-muted-foreground flex gap-2">
                            <Check className="size-4 text-[hsl(var(--brand-electric))] shrink-0 mt-0.5" /> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3">Automation workflows</h3>
                      <ul className="space-y-2 mb-6">
                        {ind.workflows.map((w) => (
                          <li key={w} className="text-sm text-muted-foreground">→ {w}</li>
                        ))}
                      </ul>
                      <h3 className="font-semibold mb-3">Integrations</h3>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {ind.integrations.map((int) => (
                          <span key={int} className="text-xs px-3 py-1 rounded-full bg-secondary border border-border">{int}</span>
                        ))}
                      </div>
                      <div className="p-4 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/20">
                        <p className="text-sm font-medium text-[hsl(var(--brand-electric))]">ROI</p>
                        <p className="text-sm text-muted-foreground mt-1">{ind.roi}</p>
                      </div>
                      <h3 className="font-semibold mt-6 mb-2">Customer outcomes</h3>
                      <ul className="space-y-1">
                        {ind.outcomes.map((o) => (
                          <li key={o} className="text-sm text-muted-foreground">✓ {o}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-3">
                    <Button asChild className="rounded-full bg-[#0066FF] hover:bg-[#00C6FF]">
                      <Link href="/book-demo">Book industry demo</Link>
                    </Button>
                    <Button asChild variant="ghost" className="rounded-full">
                      <Link href="/growth-audit">Free growth assessment</Link>
                    </Button>
                  </div>
                </GlassCard>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
