'use client'

import { TRADITIONAL_VS_PLATFORM } from '@/lib/marketing-content'
import { FadeIn } from '@/components/gix/enterprise/primitives'
import { ArrowRight } from 'lucide-react'

export default function TraditionalVsPlatformSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#050d1f] text-white">
      <div className="container">
        <FadeIn>
          <div className="max-w-3xl mb-14 text-center mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00C6FF] mb-3">Why choose us</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Traditional IT vs AsoftechInsightz
            </h2>
            <p className="mt-4 text-lg text-white/70 leading-relaxed">
              Move from fragmented tools to an integrated, AI-first platform.
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-3 bg-white/5 text-xs uppercase tracking-wider font-semibold">
            <div className="p-4 text-white/50">Traditional</div>
            <div className="p-4 text-center text-white/30" aria-hidden />
            <div className="p-4 text-[#00C6FF]">AsoftechInsightz</div>
          </div>
          {TRADITIONAL_VS_PLATFORM.map((row, i) => (
            <FadeIn key={row.traditional} delay={i * 0.04}>
              <div className="grid grid-cols-3 border-t border-white/10 items-center text-sm">
                <div className="p-5 text-white/60">{row.traditional}</div>
                <div className="flex justify-center p-2">
                  <ArrowRight className="size-4 text-[#FF7A00]" aria-hidden />
                </div>
                <div className="p-5 font-medium text-white">{row.platform}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
