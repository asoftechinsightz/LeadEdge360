'use client'

import { INTEGRATIONS } from '@/lib/marketing-content'
import { SectionHeader, GlassCard, FadeIn } from '@/components/gix/enterprise/primitives'

export default function IntegrationsSection() {
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Integrations"
            title="Connect your entire growth stack"
            description="Native connectors and API-first architecture — plug into the tools your team already uses."
          />
        </FadeIn>
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {INTEGRATIONS.map((name, i) => (
            <FadeIn key={name} delay={i * 0.03}>
              <GlassCard className="px-5 py-3 text-sm font-medium text-foreground hover:gix-glow transition-shadow">
                {name}
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
