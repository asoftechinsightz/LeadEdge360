'use client'

import { AI_CAPABILITIES } from '@/lib/marketing-content'
import { SectionHeader, FadeIn } from '@/components/gix/enterprise/primitives'
import { Sparkles } from 'lucide-react'

export default function AICapabilitiesSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="AI Capabilities"
            title="Intelligence across every workflow"
            description="From lead scoring to expiry prediction — AI that drives decisions, not just dashboards."
          />
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AI_CAPABILITIES.map((cap, i) => (
            <FadeIn key={cap} delay={i * 0.04}>
              <div className="gix-glass rounded-xl border border-border p-5 flex items-start gap-3 hover:gix-glow transition-shadow">
                <Sparkles className="size-4 text-[hsl(var(--brand-electric))] mt-0.5 shrink-0" />
                <span className="text-sm font-medium leading-snug">{cap}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
