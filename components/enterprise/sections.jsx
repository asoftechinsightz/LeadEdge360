'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronDown, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FadeIn, GlassCard, SectionHeader } from '@/components/gix/enterprise/primitives'
import MarketingPageHero from '@/components/gix/enterprise/MarketingPageHero'
import { PRODUCT_SCREENSHOTS } from '@/lib/marketing-content'

import { TrustStrip } from '@/components/enterprise/TrustBadges'

export function EnterpriseHero({ hero, showDashboard = true, productId }) {
  return (
    <>
      <MarketingPageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        accent={hero.accent}
        description={hero.description}
        ctaHref="/book-demo"
        ctaLabel="Book a Demo"
        secondaryHref="/signup"
        secondaryLabel="Start Free Trial"
      />
      <TrustStrip />
      {showDashboard && !productId && (
        <section className="container pb-20 -mt-4">
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl overflow-hidden border border-white/10 gix-glow gix-glass-dark">
                <Image src={PRODUCT_SCREENSHOTS.leadedge360} alt="LeadEdge360 dashboard" width={700} height={450} className="w-full h-auto" />
                <p className="p-4 text-sm text-slate-400 border-t border-white/10">LeadEdge360 — AI CRM & revenue</p>
              </div>
              <div className="rounded-2xl overflow-hidden border border-white/10 gix-glow gix-glass-dark">
                <Image src={PRODUCT_SCREENSHOTS.retailedge360} alt="RetailEdge360 dashboard" width={700} height={450} className="w-full h-auto" />
                <p className="p-4 text-sm text-slate-400 border-t border-white/10">RetailEdge360 — POS & inventory intelligence</p>
              </div>
            </div>
          </FadeIn>
        </section>
      )}
    </>
  )
}

export function BusinessChallengesSection({ challenges, title = 'Business challenges we solve' }) {
  if (!challenges?.length) return null
  return (
    <section className="py-20 border-t border-white/5">
      <div className="container">
        <FadeIn>
          <SectionHeader eyebrow="Challenges" title={title} description="Every implementation starts with the problems costing you revenue, margin, or time." />
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-5">
          {challenges.map((c, i) => (
            <FadeIn key={c.title} delay={i * 0.04}>
              <GlassCard className="p-6 h-full">
                <h3 className="font-semibold text-lg text-white">{c.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{c.desc}</p>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AISolutionsSection({ solutions }) {
  if (!solutions?.length) return null
  return (
    <section className="py-20">
      <div className="container">
        <FadeIn>
          <SectionHeader eyebrow="AI solutions" title="How AI transforms your operations" description="Productized intelligence — not science projects." />
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {solutions.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.04}>
              <GlassCard className="p-6 h-full hover:gix-glow transition-shadow">
                <span className="text-[10px] uppercase tracking-widest text-cyan-400">{s.product}</span>
                <h3 className="font-semibold text-lg mt-2 text-white">{s.title}</h3>
                <p className="text-sm text-slate-400 mt-2">{s.desc}</p>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProductMappingSection({ products }) {
  if (!products?.length) return null
  return (
    <section className="py-20 border-t border-white/5 bg-[#050a18]/50">
      <div className="container">
        <FadeIn>
          <SectionHeader eyebrow="Products" title="The right platform for the job" description="LeadEdge360 for revenue. RetailEdge360 for store operations. Trinetra360 for enterprise observability." />
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-8">
          {products.map((p, i) => (
            <FadeIn key={p.name} delay={i * 0.08}>
              <GlassCard className="p-8 h-full gix-glow">
                <h3 className="font-display text-2xl font-bold text-white">{p.name}</h3>
                <p className="text-slate-400 mt-2">{p.desc}</p>
                <ul className="mt-6 space-y-2">
                  {p.capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-2 text-sm text-slate-400">
                      <Check className="size-4 text-cyan-400 shrink-0" />
                      {cap}
                    </li>
                  ))}
                </ul>
                <Button asChild className="rounded-full mt-8 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0">
                  <Link href={p.href}>Explore {p.name} <ArrowRight className="ml-2 size-4" /></Link>
                </Button>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FeaturesGridSection({ features }) {
  if (!features?.length) return null
  return (
    <section className="py-20">
      <div className="container">
        <FadeIn>
          <SectionHeader eyebrow="Platform" title="Enterprise-grade capabilities" />
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.04}>
              <GlassCard className="p-5 h-full"><h3 className="font-medium text-white">{f.title}</h3><p className="text-sm text-slate-400 mt-2">{f.desc}</p></GlassCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

export function BusinessOutcomesSection({ outcomes }) {
  if (!outcomes?.length) return null
  return (
    <section className="py-20 border-t border-white/5">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Outcomes"
            title="Business value delivered"
            description="Capability outcomes from our platforms — we do not publish unverified customer metrics."
            className="text-white [&_p]:text-slate-400"
          />
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {outcomes.map((o, i) => (
            <FadeIn key={o.title || o.label} delay={i * 0.05}>
              <div className="gix-glass-dark rounded-2xl border border-white/10 p-6 h-full">
                {o.metric ? (
                  <>
                    <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{o.metric}</p>
                    <p className="font-medium mt-2 text-white">{o.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{o.context}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-white">{o.title}</p>
                    <p className="text-sm text-slate-400 mt-2 leading-relaxed">{o.desc}</p>
                  </>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

export function IntegrationsStripSection({ integrations }) {
  if (!integrations?.length) return null
  return (
    <section className="py-16 border-y border-white/5">
      <div className="container">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-500 mb-8">Integrations</p>
        <div className="flex flex-wrap justify-center gap-3">
          {integrations.map((name) => (
            <span key={name} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-slate-300">{name}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CustomerSuccessStrip({ customerSuccess }) {
  if (!customerSuccess) return null
  return (
    <section className="py-20">
      <div className="container">
        <FadeIn>
          <SectionHeader eyebrow="Customers" title={customerSuccess.headline} align="left" />
        </FadeIn>
        <div className="grid md:grid-cols-2 gap-6">
          {customerSuccess.stories.map((s, i) => (
            <FadeIn key={s.company} delay={i * 0.06}>
              <GlassCard className="p-6">
                <h3 className="font-semibold">{s.company}</h3>
                <p className="text-xl font-bold gradient-text mt-2">{s.result}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.product}</p>
              </GlassCard>
            </FadeIn>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/customers" className="text-sm text-[hsl(var(--brand-electric))] hover:underline">View all customer stories →</Link>
        </div>
      </div>
    </section>
  )
}

export function SecurityStripSection({ security }) {
  if (!security?.length) return null
  return (
    <section className="py-20 bg-[#050a18]/60">
      <div className="container">
        <FadeIn>
          <SectionHeader eyebrow="Security" title="Enterprise trust & compliance" />
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {security.map((item) => (
            <GlassCard key={item} className="p-4 text-sm flex items-center gap-2 text-slate-300">
              <Check className="size-4 text-cyan-400 shrink-0" />
              {item}
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FAQSection({ faq, className = '' }) {
  if (!faq?.length) return null
  return (
    <section className={`py-20 ${className}`}>
      <div className="container max-w-3xl">
        <FadeIn>
          <SectionHeader
            eyebrow="FAQ"
            title="Frequently asked questions"
            className="text-white [&_p]:text-slate-400"
          />
        </FadeIn>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <FAQItem key={item.q} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <FadeIn delay={index * 0.03}>
      <GlassCard className="overflow-hidden">
        <button type="button" className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpen(!open)}>
          <span className="font-medium pr-4 text-white">{item.q}</span>
          <ChevronDown className={`size-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && <p className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/10 pt-4">{item.a}</p>}
      </GlassCard>
    </FadeIn>
  )
}

export function EnterpriseFinalCTA({ cta }) {
  if (!cta) return null
  return (
    <section className="py-24">
      <div className="container">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl gix-premium-dark-band gix-glow p-10 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0066FF]/25 via-transparent to-[#00C6FF]/15 pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white">{cta.title}</h2>
              <p className="mt-4 text-lg text-slate-300">{cta.description}</p>
              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <Button asChild size="lg" className="rounded-full px-10 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0">
                  <Link href={cta.primaryHref || '/book-demo'}>{cta.primaryLabel || 'Book Demo'} <ArrowRight className="ml-2 size-4" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-10 border-white/25 bg-white/5 text-white hover:bg-white/10">
                  <Link href={cta.secondaryHref || '/signup'}>{cta.secondaryLabel || 'Start Free Trial'}</Link>
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
