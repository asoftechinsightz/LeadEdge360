'use client'

import Link from 'next/link'
import { ArrowRight, Store, Users, Layers, Radar, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { GROWTH_JOURNEY_STEPS } from '@/lib/marketing-content'
import { FadeIn, SectionHeader } from '@/components/gix/enterprise/primitives'

const STEP_ICONS = {
  digitize: Store,
  customers: Users,
  suite: Layers,
  observe: Radar,
}

const STORY_CONNECTORS = [
  'Business starts here',
  'Digitize operations',
  'Acquire customers',
  'Grow revenue',
  'Observe · Predict · Resolve',
]

export default function GrowthJourneyFlowSection() {
  return (
    <section className="py-24 lg:py-32 border-y border-white/5 bg-[#050a18]/80 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,#0066FF08,transparent_50%)] pointer-events-none" />

      <div className="container relative">
        <FadeIn>
          <SectionHeader
            eyebrow="Continuous journey"
            title="Your Business Growth Journey"
            description="Every section flows into the next — from your first digital sale to enterprise observability."
            className="text-white [&_p]:text-slate-400"
          />
        </FadeIn>

        {/* Story ribbon */}
        <FadeIn delay={0.05}>
          <div className="flex flex-wrap justify-center gap-2 mt-8 mb-12">
            {STORY_CONNECTORS.map((label, i) => (
              <span key={label} className="inline-flex items-center gap-2 text-xs text-slate-500">
                {i > 0 && <ChevronDown className="size-3 rotate-[-90deg] hidden sm:inline" />}
                <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-slate-400">
                  {label}
                </span>
              </span>
            ))}
          </div>
        </FadeIn>

        <div className="relative mt-4">
          <div className="hidden xl:block absolute top-[2.75rem] left-[8%] right-[8%] h-px">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500/40 via-blue-500/40 via-cyan-500/40 to-violet-500/40"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'left' }}
            />
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 xl:gap-4">
            {GROWTH_JOURNEY_STEPS.map((step, i) => {
              const Icon = STEP_ICONS[step.id] || Store
              return (
                <FadeIn key={step.id} delay={i * 0.07}>
                  <Link href={step.href} className="group block text-center">
                    <motion.div
                      className={`relative mx-auto size-14 rounded-full flex items-center justify-center border-2 transition-colors ${
                        step.enterprise
                          ? 'border-violet-500/50 bg-violet-950/40 group-hover:border-violet-400 group-hover:shadow-[0_0_24px_rgba(139,92,246,0.35)]'
                          : 'border-cyan-500/40 bg-cyan-950/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_24px_rgba(0,198,255,0.25)]'
                      }`}
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    >
                      <Icon className="size-6" style={{ color: step.accent }} />
                      <span className="absolute -top-2 -right-2 size-6 rounded-full bg-[#030712] border border-white/20 text-[10px] font-mono text-slate-400 flex items-center justify-center">
                        {step.step}
                      </span>
                    </motion.div>

                    <p className="text-[10px] uppercase tracking-widest mt-4 mb-1" style={{ color: step.accent }}>
                      {step.product}
                    </p>
                    <h3 className="font-display text-base font-semibold text-white group-hover:text-cyan-100 transition-colors px-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed px-2 hidden sm:block">
                      {step.desc}
                    </p>

                    {i < GROWTH_JOURNEY_STEPS.length - 1 && (
                      <ArrowRight className="size-4 text-slate-600 mx-auto mt-4 xl:hidden group-hover:text-cyan-400 transition-colors" />
                    )}
                  </Link>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
