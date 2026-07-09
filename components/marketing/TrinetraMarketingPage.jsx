'use client'

import Link from 'next/link'
import { Check, ArrowRight, Radar, Server, GitBranch, Bell, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MarketingPageHero from '@/components/gix/enterprise/MarketingPageHero'
import MarketingLeadForm from '@/components/marketing/MarketingLeadForm'
import { TRINETRA_MARKETING, PRODUCT_SCREENSHOTS } from '@/lib/marketing-content'
import { FadeIn, GlassCard, SectionHeader } from '@/components/gix/enterprise/primitives'
import { TrustStrip } from '@/components/enterprise/TrustBadges'
import ProductExperienceSection from '@/components/gix/three/ProductExperienceSection'
import { DeviceShowcase } from '@/components/marketing/DeviceMockup'

const NOC_FEATURES = [
  { icon: Server, label: 'Infrastructure & apps', desc: 'Servers, cloud, containers' },
  { icon: GitBranch, label: 'Traces & logs', desc: 'Distributed tracing + log analytics' },
  { icon: Bell, label: 'Alert intelligence', desc: 'Correlated incidents, noise reduction' },
  { icon: Brain, label: 'AIOps & RCA', desc: 'Root cause analysis workflows' },
]

export default function TrinetraMarketingPage() {
  const product = TRINETRA_MARKETING

  return (
    <>
      <MarketingPageHero
        eyebrow={product.name}
        title="Observe everything."
        accent="Predict issues. Resolve faster."
        description={product.message}
        ctaHref={product.demoHref}
        ctaLabel="Request Early Access"
        secondaryHref="/contact"
        secondaryLabel="Talk to Solutions"
      />
      <TrustStrip />

      <ProductExperienceSection
        scene="noc"
        eyebrow="Network Operations Center"
        title="Observe everything. Predict issues. Resolve faster."
        description="Infrastructure, applications, logs, traces, and AIOps alerts — visualized for IT and executive teams."
      />

      <section className="container pb-20">
        <FadeIn>
          <SectionHeader eyebrow="Executive dashboard" title="Enterprise command center" align="left" />
        </FadeIn>
        <div className="mt-8 max-w-5xl">
          <DeviceShowcase
            src={PRODUCT_SCREENSHOTS.trinetra360}
            alt="Trinetra360 executive home dashboard"
            glow="violet"
          />
        </div>
      </section>

      <section className="container pb-20">
        <FadeIn>
          <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-[#050d1f] via-[#0a1628] to-[#1a0a2e] p-8 lg:p-12 text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-30 pointer-events-none" aria-hidden>
              <div className="absolute top-1/4 left-1/4 size-64 rounded-full bg-violet-600/30 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 size-48 rounded-full bg-cyan-500/20 blur-3xl" />
            </div>
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <Radar className="size-12 text-violet-400 mb-4" />
                <h2 className="font-display text-3xl font-bold">Network Operations Center</h2>
                <p className="text-white/70 mt-4 leading-relaxed">
                  Trinetra360 delivers infrastructure monitoring, APM, log analytics, and AIOps in a unified
                  observability stack — available for early-access deployments alongside our CRM and retail platforms.
                </p>
                <p className="text-sm text-violet-300/90 mt-4">
                  Early access: features and availability evolve with pilot feedback. Book a demo for current capability map.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {NOC_FEATURES.map((f) => {
                  const Icon = f.icon
                  return (
                    <div key={f.label} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <Icon className="size-5 text-cyan-400 mb-2" />
                      <div className="font-medium text-sm">{f.label}</div>
                      <div className="text-xs text-white/50 mt-1">{f.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      <section className="container pb-20">
        <FadeIn>
          <SectionHeader eyebrow="Capabilities" title="Enterprise observability modules" align="left" />
        </FadeIn>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
          {product.highlights.map((h, i) => (
            <FadeIn key={h} delay={i * 0.03}>
              <li className="flex items-center gap-2 text-sm p-4 rounded-lg border border-white/10 bg-white/5 text-slate-300">
                <Check className="size-4 text-violet-400 shrink-0" />
                {h}
              </li>
            </FadeIn>
          ))}
        </ul>
      </section>

      <section className="container pb-24 grid lg:grid-cols-2 gap-10">
        <FadeIn>
          <GlassCard className="p-8">
            <h3 className="font-display text-xl font-bold mb-4">Request early access</h3>
            <MarketingLeadForm source="trinetra360" product="trinetra360" />
          </GlassCard>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-white">Works with LeadEdge360</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Revenue and CRM events from LeadEdge360 can feed executive dashboards while Trinetra360 monitors the
              applications that power your customer-facing stack.
            </p>
            <Button asChild variant="outline" className="rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10">
              <Link href="/products/leadedge360">
                Explore LeadEdge360 <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </section>
    </>
  )
}
