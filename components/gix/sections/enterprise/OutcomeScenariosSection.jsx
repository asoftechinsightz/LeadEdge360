'use client'

import { OUTCOME_SCENARIOS } from '@/lib/marketing-content'
import { SectionHeader, GlassCard, FadeIn } from '@/components/gix/enterprise/primitives'

/** Honest scenario cards — not attributed to fake companies. */
export default function OutcomeScenariosSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Use cases"
            title="How organizations use the platform"
            description="Illustrative scenarios based on product capabilities and pilot deployments. We do not publish fabricated customer logos or unverified ROI claims."
          />
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {OUTCOME_SCENARIOS.map((s, i) => (
            <FadeIn key={s.scenario} delay={i * 0.08}>
              <GlassCard className="p-8 h-full flex flex-col">
                <span className="text-xs uppercase tracking-wider text-[hsl(var(--brand-electric))]">{s.industry}</span>
                <h3 className="font-semibold text-lg mt-2">{s.scenario}</h3>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed flex-1">{s.outcome}</p>
                <p className="text-xs text-muted-foreground/80 mt-4 pt-4 border-t border-border italic">{s.note}</p>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
