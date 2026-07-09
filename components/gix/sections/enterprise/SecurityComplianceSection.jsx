'use client'

import { SECURITY_FEATURES } from '@/lib/marketing-content'
import { SectionHeader, GlassCard, FadeIn } from '@/components/gix/enterprise/primitives'
import { ShieldCheck } from 'lucide-react'

export default function SecurityComplianceSection() {
  return (
    <section className="py-24 lg:py-32 border-t border-border/60">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Security & Compliance"
            title="Enterprise trust, by design"
            description="Multi-tenant isolation, encryption, and auditability for regulated industries and scaling teams."
          />
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {SECURITY_FEATURES.map((feature, i) => (
            <FadeIn key={feature} delay={i * 0.05}>
              <GlassCard className="p-5 flex items-center gap-3">
                <ShieldCheck className="size-5 text-[hsl(var(--brand-electric))] shrink-0" />
                <span className="text-sm">{feature}</span>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
