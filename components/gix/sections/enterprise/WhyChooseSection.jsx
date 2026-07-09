'use client'

import { WHY_CHOOSE } from '@/lib/marketing-content'
import { SectionHeader, GlassCard, FadeIn } from '@/components/gix/enterprise/primitives'
import { Shield, Cpu, Cloud, Plug, Users, Lock, TrendingUp, Smartphone, Zap } from 'lucide-react'

const ICONS = [Shield, Cpu, Cloud, Plug, Users, Lock, TrendingUp, Smartphone, Zap]

export default function WhyChooseSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Why AsoftechInsightz"
            title="Enterprise-grade SaaS, built AI-first"
            description="Not an IT services shop — a product company shipping cloud-native platforms that scale with your business."
          />
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_CHOOSE.map((item, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <FadeIn key={item.title} delay={i * 0.05}>
                <GlassCard className="p-6 h-full hover:gix-glow transition-shadow">
                  <div className="p-2.5 rounded-xl bg-white border border-border w-fit mb-4">
                    <Icon className="size-5 text-[hsl(var(--brand-electric))]" />
                  </div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
                </GlassCard>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
