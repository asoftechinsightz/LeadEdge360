'use client'

import { STARTUP_INDIA_NARRATIVE } from '@/lib/marketing-content'
import { SectionHeader, FadeIn } from '@/components/gix/enterprise/primitives'
import { Lightbulb, Info } from 'lucide-react'

export default function StartupIndiaSection() {
  const { title, points, disclaimer } = STARTUP_INDIA_NARRATIVE

  return (
    <section className="py-24 lg:py-32 border-t border-white/5">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Innovation"
            title={title}
            description="Cloud-native SaaS built in India for MSMEs, retailers, and enterprises adopting AI responsibly."
            className="text-white [&_p]:text-slate-400"
          />
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {points.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.05}>
              <div className="gix-glass-dark rounded-2xl border border-white/10 p-6 h-full hover:border-violet-500/30 transition-colors">
                <Lightbulb className="size-5 text-violet-400 mb-3" />
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{p.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2}>
          <div className="mt-10 flex gap-3 p-5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm text-amber-100">
            <Info className="size-5 shrink-0 mt-0.5" aria-hidden />
            <p>{disclaimer}</p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
