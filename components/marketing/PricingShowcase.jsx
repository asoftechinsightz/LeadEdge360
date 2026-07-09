'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, Building2, Store, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FadeIn } from '@/components/gix/enterprise/primitives'
import { PRICING_V5 } from '@/lib/marketing-content'
import { cn } from '@/lib/utils'

const PRODUCT_TABS = [
  { id: 'retailedge360', label: 'RetailEdge360', icon: Store },
  { id: 'leadedge360', label: 'LeadEdge360', icon: Users },
]

export default function PricingShowcase({ showBundles = true, showTrinetraNote = true, compact = false }) {
  const [active, setActive] = useState('retailedge360')
  const product = PRICING_V5[active]

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap justify-center gap-3">
        {PRODUCT_TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all',
                active === tab.id
                  ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-lg shadow-blue-500/25'
                  : 'bg-white/5 border-white/10 text-muted-foreground hover:border-[#0066FF]/40',
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <FadeIn key={active}>
        <p className="text-center text-sm text-muted-foreground mb-8 max-w-xl mx-auto">{product.tagline}</p>
        <div
          className={cn(
            'grid gap-5 mx-auto',
            compact ? 'md:grid-cols-2 max-w-4xl' : 'md:grid-cols-2 xl:grid-cols-4 max-w-7xl',
          )}
        >
          {product.tiers.map((tier, i) => (
            <FadeIn key={tier.id} delay={i * 0.06}>
              <Card
                className={cn(
                  'h-full border-white/10 bg-card/30 backdrop-blur-xl',
                  tier.highlight && 'gix-glow border-[#0066FF]/50 ring-1 ring-[#0066FF]/20',
                )}
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <p className="text-xs uppercase tracking-widest text-[hsl(var(--brand-electric))]">{tier.name}</p>
                  {tier.badge && (
                    <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {tier.badge}
                    </span>
                  )}
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-3xl md:text-4xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
                  </div>
                  {tier.setupFee && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {tier.setupLabel || 'One-Time Setup'}: <span className="text-foreground font-medium">{tier.setupFee}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">Ideal for: {tier.idealFor}</p>
                  <ul className="mt-6 space-y-2 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="size-4 shrink-0 text-[hsl(var(--brand-electric))] mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="rounded-full mt-6 w-full bg-[#0066FF] hover:bg-[#00C6FF]">
                    <Link href={tier.cta.href}>
                      {tier.cta.label}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </FadeIn>

      {showBundles && (
        <div className="max-w-5xl mx-auto space-y-6 pt-8 border-t border-white/10">
          <h3 className="text-center font-display text-2xl font-semibold">Bundle plans</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {PRICING_V5.bundles.map((bundle) => (
              <Card
                key={bundle.id}
                className={cn(
                  'border-white/10 bg-gradient-to-br from-slate-900/80 to-blue-950/40 backdrop-blur-xl',
                  bundle.highlight && 'gix-glow border-cyan-500/40',
                )}
              >
                <CardContent className="p-8">
                  <p className="text-xs uppercase tracking-widest text-cyan-400">{bundle.name}</p>
                  {bundle.badge && (
                    <span className="inline-block mt-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {bundle.badge}
                    </span>
                  )}
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold">{bundle.price}</span>
                    {bundle.period && <span className="text-sm text-muted-foreground">{bundle.period}</span>}
                  </div>
                  {bundle.setupFee && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {bundle.setupLabel || 'One-Time Setup'}: <span className="text-foreground font-medium">{bundle.setupFee}</span>
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">{bundle.idealFor}</p>
                  <p className="text-xs text-cyan-300/80 mt-3">Includes: {bundle.includes.join(' + ')}</p>
                  <ul className="mt-4 space-y-2">
                    {bundle.features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                        <Check className="size-4 shrink-0 text-cyan-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild variant="outline" className="rounded-full mt-6 w-full border-cyan-500/40">
                    <Link href={bundle.cta.href}>{bundle.cta.label}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {showTrinetraNote && (
        <Card className="max-w-3xl mx-auto border-violet-500/30 bg-violet-950/20 backdrop-blur-xl">
          <CardContent className="p-8 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/20 border border-violet-400/30">
              <Building2 className="size-6 text-violet-300" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-violet-100">{PRICING_V5.trinetra360.product}</p>
              <p className="text-sm text-muted-foreground mt-1">{PRICING_V5.trinetra360.note}</p>
            </div>
            <Button asChild className="rounded-full shrink-0 bg-violet-600 hover:bg-violet-500">
              <Link href={PRICING_V5.trinetra360.cta.href}>{PRICING_V5.trinetra360.cta.label}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
        All plans are billed monthly in INR. Digital delivery — your workspace is provisioned instantly after payment.
        See our{' '}
        <Link href="/refund-policy" className="text-[hsl(var(--brand-electric))] hover:underline">refund</Link>,{' '}
        <Link href="/cancellation-policy" className="text-[hsl(var(--brand-electric))] hover:underline">cancellation</Link>, and{' '}
        <Link href="/shipping-delivery" className="text-[hsl(var(--brand-electric))] hover:underline">digital delivery</Link>{' '}
        policies.
      </p>
    </div>
  )
}
