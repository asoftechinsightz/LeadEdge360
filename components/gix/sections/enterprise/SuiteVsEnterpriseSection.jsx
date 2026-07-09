'use client'

import Link from 'next/link'
import { ArrowRight, Building2, Store, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeader, FadeIn } from '@/components/gix/enterprise/primitives'
import { SUITE_VS_ENTERPRISE } from '@/lib/marketing-content'
import { DeviceShowcase } from '@/components/marketing/DeviceMockup'
import { PRODUCT_SCREENSHOTS } from '@/lib/marketing-content'

export default function SuiteVsEnterpriseSection() {
  const { businessSuite, enterprisePlatform } = SUITE_VS_ENTERPRISE

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-violet-950/20 pointer-events-none" />
      <div className="container relative">
        <FadeIn>
          <SectionHeader
            eyebrow="Two platforms, one company"
            title="Business Suite vs Enterprise Platform"
            description="RetailEdge360 and LeadEdge360 help Indian SMBs digitize and grow. Trinetra360 is a separate enterprise observability product — not part of the Business Suite."
          />
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 mt-12">
          <FadeIn delay={0.05}>
            <div className="h-full rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-[#050a1f] p-8 lg:p-10 gix-glass">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-400/30">
                  <Store className="size-5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-cyan-400">SMB Platform</p>
                  <h3 className="font-display text-2xl font-bold">{businessSuite.title}</h3>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{businessSuite.subtitle}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {businessSuite.products.map((p) => (
                  <span key={p} className="px-3 py-1 rounded-full text-xs bg-cyan-500/10 border border-cyan-500/25 text-cyan-200">
                    {p}
                  </span>
                ))}
              </div>
              <ul className="mt-6 space-y-2">
                {businessSuite.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Sparkles className="size-4 shrink-0 text-cyan-400 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-cyan-600 hover:bg-cyan-500">
                  <Link href={businessSuite.cta.href}>
                    {businessSuite.cta.label}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-cyan-500/30">
                  <a href={businessSuite.appUrl} target="_blank" rel="noopener noreferrer">
                    Open app
                  </a>
                </Button>
              </div>
              <div className="mt-10">
                <DeviceShowcase
                  src={PRODUCT_SCREENSHOTS.retailedge360}
                  alt="RetailEdge360 dashboard"
                  glow="orange"
                />
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.12}>
            <div className="h-full rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-950/40 via-slate-900/60 to-[#050a1f] p-8 lg:p-10 gix-glass">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-400/30">
                  <Building2 className="size-5 text-violet-300" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-violet-400">Enterprise only</p>
                  <h3 className="font-display text-2xl font-bold">{enterprisePlatform.title}</h3>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{enterprisePlatform.subtitle}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {enterprisePlatform.products.map((p) => (
                  <span key={p} className="px-3 py-1 rounded-full text-xs bg-violet-500/10 border border-violet-500/25 text-violet-200">
                    {p}
                  </span>
                ))}
              </div>
              <ul className="mt-6 space-y-2">
                {enterprisePlatform.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Sparkles className="size-4 shrink-0 text-violet-400 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="rounded-full bg-violet-600 hover:bg-violet-500">
                  <Link href={enterprisePlatform.cta.href}>
                    {enterprisePlatform.cta.label}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-violet-500/30">
                  <a href={enterprisePlatform.appUrl} target="_blank" rel="noopener noreferrer">
                    Enterprise console
                  </a>
                </Button>
              </div>
              <div className="mt-10">
                <DeviceShowcase
                  src={PRODUCT_SCREENSHOTS.trinetra360}
                  alt="Trinetra360 executive dashboard"
                  glow="violet"
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
