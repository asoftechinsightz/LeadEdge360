'use client'

import Link from 'next/link'
import { FadeIn, GlassCard, SectionHeader } from '@/components/gix/enterprise/primitives'

export default function CompanySections({ page }) {
  return (
    <>
      <section className="py-20 border-t border-border/60">
        <div className="container grid md:grid-cols-2 gap-8">
          <FadeIn>
            <GlassCard className="p-8 h-full">
              <h2 className="font-display text-2xl font-bold text-[hsl(var(--brand-electric))]">{page.mission.title}</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">{page.mission.text}</p>
            </GlassCard>
          </FadeIn>
          <FadeIn delay={0.08}>
            <GlassCard className="p-8 h-full">
              <h2 className="font-display text-2xl font-bold text-[hsl(var(--brand-electric))]">{page.vision.title}</h2>
              <p className="text-muted-foreground mt-4 leading-relaxed">{page.vision.text}</p>
            </GlassCard>
          </FadeIn>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <FadeIn>
            <SectionHeader eyebrow="Values" title="What we stand for" />
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {page.values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.04}>
                <GlassCard className="p-6 h-full">
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{v.desc}</p>
                </GlassCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/60 bg-secondary/50">
        <div className="container">
          <FadeIn>
            <SectionHeader eyebrow="Innovation" title="AI vision & product innovation" />
          </FadeIn>
          <ul className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {page.innovation.map((item) => (
              <li key={item} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-[hsl(var(--brand-electric))]">▸</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-2xl text-center">
          <FadeIn>
            <GlassCard className="p-10">
              <h2 className="font-display text-2xl font-bold">Careers</h2>
              <p className="text-muted-foreground mt-4">{page.careers.text}</p>
              <Link href={page.careers.href} className="inline-block mt-6 text-[hsl(var(--brand-electric))] hover:underline">
                {page.careers.label} →
              </Link>
            </GlassCard>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
