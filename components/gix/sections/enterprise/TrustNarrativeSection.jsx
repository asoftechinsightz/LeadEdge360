'use client'

import { FadeIn, SectionHeader } from '@/components/gix/enterprise/primitives'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/** Homepage "Who we are" trust narrative — preserves brand, adds enterprise storytelling */
export default function TrustNarrativeSection() {
  return (
    <section className="py-24 border-y border-border/60 bg-secondary/50">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Who we are"
            title="An AI digital transformation company"
            description="We build and run enterprise SaaS — not generic IT services. AsoftechInsightz ships LeadEdge360 for revenue teams and RetailEdge360 for store operators, and uses both to grow our own business."
          />
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-4">
          {[
            {
              title: 'What we build',
              desc: 'AI CRM, sales automation, smart POS, and inventory intelligence — multi-tenant, API-first, mobile-ready.',
              href: '/products/leadedge360',
            },
            {
              title: 'Who we help',
              desc: 'Founders, CIOs, retail chains, real estate brokers, pharmacies, and professional services firms scaling past spreadsheets.',
              href: '/industries',
            },
            {
              title: 'Why trust us',
              desc: 'Dogfooding our platform, published ROI metrics, enterprise security, and startup-program ready architecture.',
              href: '/customers',
            },
          ].map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.08}>
              <Link href={item.href} className="block group h-full p-6 rounded-2xl border border-border bg-white/[0.03] hover:gix-glow transition-shadow">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.desc}</p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm text-[hsl(var(--brand-electric))] group-hover:underline">
                  Learn more <ArrowRight className="size-3.5" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
