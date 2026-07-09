'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FadeIn, GlassCard, SectionHeader } from '@/components/gix/enterprise/primitives'

export default function ResourcesGridSection({ page }) {
  return (
    <>
      <section className="py-20 border-t border-white/5">
        <div className="container">
          <FadeIn>
            <SectionHeader eyebrow="Library" title="Resources by format" />
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {page.categories.map((cat, i) => (
              <FadeIn key={cat.title} delay={i * 0.03}>
                <Link href={cat.href}>
                  <GlassCard className="p-6 h-full group hover:gix-glow transition-shadow">
                    <span className="text-[10px] uppercase tracking-widest text-cyan-400">{cat.type}</span>
                    <h3 className="font-semibold mt-2 text-white flex items-center justify-between gap-2">
                      {cat.title}
                      <ArrowRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity text-violet-400" />
                    </h3>
                    <p className="text-sm text-slate-400 mt-2">{cat.desc}</p>
                  </GlassCard>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <FadeIn>
            <SectionHeader eyebrow="Topics" title="Featured knowledge areas" />
          </FadeIn>
          <div className="flex flex-wrap justify-center gap-3">
            {page.featuredTopics.map((topic) => (
              <Link
                key={topic}
                href={`/blog?topic=${topic.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm text-slate-300 hover:gix-glow transition-shadow"
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
