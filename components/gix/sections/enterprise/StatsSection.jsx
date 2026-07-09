'use client'

import CountUp from '@/components/site/CountUp'
import { SectionHeader, GlassCard, FadeIn } from '@/components/gix/enterprise/primitives'

const STATS = [
  { end: 12, suffix: '+', label: 'Pilot Organizations', prefix: '' },
  { end: 12, suffix: '', label: 'AI Employees', prefix: '' },
  { end: 50, suffix: 'K+', label: 'Tasks Automated', prefix: '' },
  { end: 10, suffix: 'Cr+', label: 'Revenue Managed', prefix: '₹' },
  { end: 98, suffix: '%', label: 'Platform Uptime', prefix: '' },
  { end: 35, suffix: '%', label: 'Conversion Lift', prefix: '+' },
]

export default function StatsSection() {
  return (
    <section className="py-20 lg:py-28 border-y border-border bg-secondary/50">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Impact"
            title="Trusted at enterprise scale"
            description="Measurable outcomes across organizations deploying Agentic AI growth intelligence."
          />
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.05}>
              <GlassCard className="p-6 text-center hover:gix-glow transition-shadow">
                <p className="text-2xl md:text-3xl font-bold gradient-text">
                  <CountUp end={s.end} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals || 0} />
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">{s.label}</p>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
