import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import ParticleNetwork from '@/components/site/ParticleNetwork'
import WireSphere from '@/components/site/WireSphere'
import CountUp from '@/components/site/CountUp'
import Reveal from '@/components/site/Reveal'
import {
  ArrowRight, CheckCircle2, Globe2, MapPin, MessageSquare,
  ShieldCheck, Sparkles, Target, Bot, BarChart3
} from 'lucide-react'

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <ParticleNetwork className="opacity-60" />
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="container relative pt-16 lg:pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="inline-flex items-center gap-2 mb-6 text-xs tracking-[0.18em] text-muted-foreground">
                <span className="inline-flex h-4 w-6 overflow-hidden rounded-sm flex-col">
                  <span className="flex-1 bg-[#FF8A3D]" />
                  <span className="flex-1 bg-white" />
                  <span className="flex-1 bg-[#22C55E]" />
                </span>
                A MADE-IN-INDIA AI SAAS SUITE
              </div>
              <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-balance">
                Transforming<br/>Businesses Through<br/>
                <span className="gradient-text">AI &amp; Automation.</span>
              </h1>
              <p className="mt-8 text-lg text-muted-foreground max-w-xl leading-relaxed">
                One login. One subscription. Two flagship products.{' '}
                <span className="text-primary font-medium">LeadEdge360</span> for geo-intelligent lead management and{' '}
                <span className="green-text font-medium">RetailEdge360</span> for AI-powered retail &amp; expiry intelligence — unified by a single AI Copilot.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="rounded-full px-7 h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground glow-orange">
                  <Link href="/signin">Start free <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-7 h-12 text-base border-border/60 bg-card/40">
                  <Link href="/signin">Sign in to console</Link>
                </Button>
              </div>
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6">
                {['Multi-tenant & RBAC', 'AI Lead Scoring', 'RevenueShield AI', 'Natural language queries'].map(t => (
                  <div key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" /> {t}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="relative max-w-md mx-auto">
                <div className="relative rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-b from-card to-background aspect-[3/4] shadow-2xl">
                  <WireSphere />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent pointer-events-none" />
                  <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-3">
                    {[
                      { l: 'LEADS SCORED', v: <CountUp end={14.2} decimals={1} suffix="K" />, c: 'text-primary' },
                      { l: 'SAVED ON EXPIRY', v: <span>₹<CountUp end={3.6} decimals={1} />Cr</span>, c: 'text-accent' },
                      { l: 'TENANTS LIVE', v: <CountUp end={240} suffix="+" />, c: 'text-foreground' },
                    ].map((s,i) => (
                      <div key={i} className="glass rounded-xl p-3">
                        <div className="text-[9px] tracking-widest text-muted-foreground">{s.l}</div>
                        <div className={`font-display text-2xl mt-1 font-semibold ${s.c}`}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -inset-6 -z-10 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 blur-3xl rounded-full" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="container py-24">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="mb-4 rounded-full border-primary/30 text-primary">Two flagship products</Badge>
            <h2 className="font-display font-bold text-4xl md:text-5xl">One suite. Built for India&apos;s growth engines.</h2>
            <p className="mt-4 text-muted-foreground">Modular SaaS designed for sales, retail and field operations — powered by a unified AI Copilot.</p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          <Reveal delay={0.05}>
            <Card className="relative overflow-hidden border-border/60 bg-card/60 group hover:border-primary/40 transition h-full">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/30 transition" />
              <CardContent className="p-8 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/15 grid place-items-center text-primary"><Target className="h-5 w-5"/></div>
                  <Badge className="bg-primary/15 text-primary border-0">Live</Badge>
                </div>
                <h3 className="font-display text-3xl font-bold">LeadEdge360</h3>
                <p className="mt-3 text-muted-foreground">Geo-intelligent lead management. Capture from Web, Facebook, Google &amp; WhatsApp — auto-score, auto-assign by territory, and close faster.</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {['AI Lead Scoring & qualification', 'Territory mapping & geo-routing', 'WhatsApp follow-up automation', 'Role-based CRM dashboard'].map(t => (
                    <li key={t} className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-primary"/>{t}</li>
                  ))}
                </ul>
                <Button asChild className="mt-7 rounded-full bg-primary hover:bg-primary/90"><Link href="/signin">Get started <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="relative overflow-hidden border-border/60 bg-card/60 group hover:border-accent/40 transition h-full">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl group-hover:bg-accent/30 transition" />
              <CardContent className="p-8 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-accent/15 grid place-items-center text-accent"><ShieldCheck className="h-5 w-5"/></div>
                  <Badge className="bg-accent/15 text-accent border-0">Coming Soon</Badge>
                </div>
                <h3 className="font-display text-3xl font-bold">RetailEdge360</h3>
                <p className="mt-3 text-muted-foreground">AI-powered retail &amp; expiry intelligence. RevenueShield AI prevents wastage, automates replenishment, and lifts margins.</p>
                <ul className="mt-6 space-y-2 text-sm">
                  {['Expiry prediction & shelf-life AI', 'Auto reorder & demand forecasting', 'SKU-level margin analytics', 'Store-wise revenue dashboards'].map(t => (
                    <li key={t} className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-accent"/>{t}</li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-7 rounded-full border-accent/40 text-accent hover:bg-accent/10"><Link href="/contact">Join waitlist <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="container py-20">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="mb-4 rounded-full border-accent/30 text-accent">Everything you need</Badge>
            <h2 className="font-display font-bold text-4xl md:text-5xl">Built for revenue teams, designed for scale.</h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { i: Globe2, t: 'Multi-channel capture', d: 'Web forms, Facebook Lead Ads, Google Lead Form, WhatsApp Business — all in one inbox.' },
            { i: Bot, t: 'AI Lead Scoring', d: 'Every lead is scored 0–100 the instant it lands, with reasoning your team can act on.' },
            { i: MapPin, t: 'Geo-qualified routing', d: 'Auto-route leads to the right agent by pincode, city, or territory.' },
            { i: MessageSquare, t: 'WhatsApp Automation', d: 'Trigger one-click follow-ups and nurture sequences over WhatsApp.' },
            { i: BarChart3, t: 'CRM Dashboards', d: 'Real-time KPIs — funnel, conversion, territory and sales performance.' },
            { i: ShieldCheck, t: 'Role-based access', d: 'Admin, Manager, Agent — fine-grained permissions across teams.' },
          ].map((f, i) => (
            <Reveal key={f.t} delay={(i % 3) * 0.05}>
              <Card className="bg-card/60 border-border/60 hover:border-primary/40 transition h-full">
                <CardContent className="p-6">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 grid place-items-center text-primary mb-4"><f.i className="h-5 w-5"/></div>
                  <div className="font-display font-semibold text-lg">{f.t}</div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.d}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* STATS BAND */}
      <section className="container py-16">
        <Reveal>
          <div className="glass rounded-3xl p-10 grid md:grid-cols-4 gap-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
            {[
              { l: 'LEADS SCORED', v: <><CountUp end={14.2} decimals={1}/>K</>, c: 'text-primary' },
              { l: 'WASTAGE SAVED', v: <>₹<CountUp end={3.6} decimals={1}/>Cr</>, c: 'text-accent' },
              { l: 'TENANTS LIVE', v: <CountUp end={240} suffix="+" />, c: 'text-primary' },
              { l: 'AI ACCURACY', v: <CountUp end={96} suffix="%" />, c: 'text-accent' },
            ].map(s => (
              <div key={s.l} className="relative">
                <div className={`font-display font-bold text-4xl md:text-5xl ${s.c}`}>{s.v}</div>
                <div className="text-xs tracking-widest mt-2 text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="container py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/20 via-card to-accent/10 p-10 md:p-16">
            <div className="absolute inset-0 opacity-30">
              <ParticleNetwork density={40} />
            </div>
            <div className="max-w-2xl relative">
              <Sparkles className="h-8 w-8 text-primary mb-4"/>
              <h2 className="font-display font-bold text-4xl md:text-5xl text-balance">Ready to give your revenue team an unfair edge?</h2>
              <p className="mt-4 text-muted-foreground text-lg">Start free in minutes. No credit card. Cancel anytime.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 glow-orange px-7 h-12"><Link href="/signin">Get started <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-7 h-12"><Link href="/contact">Talk to sales</Link></Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
