'use client'

import {
  Sparkles,
  Shield,
  TrendingUp,
  Tag,
  Building2,
  Lock,
  Flag,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { PLATFORM_OUTCOMES } from '@/lib/marketing-content'
import { FadeIn, SectionHeader } from '@/components/gix/enterprise/primitives'

const ICONS = {
  'AI Powered': Sparkles,
  'Secure Cloud Platform': Shield,
  'Built for Growth': TrendingUp,
  'Transparent Pricing': Tag,
  'Enterprise Ready': Building2,
  'DPDP Privacy First': Lock,
  'Made for Indian Businesses': Flag,
}

export default function PlatformValueSection() {
  return (
    <section className="py-20 lg:py-28 relative">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Why AsoftechInsightz"
            title="Business outcomes, not fabricated numbers"
            description="We do not display unverified customer counts, transaction volumes, or uptime percentages. These are the real reasons teams choose our platform."
            className="text-white [&_p]:text-slate-400"
          />
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-10">
          {PLATFORM_OUTCOMES.map((outcome, i) => {
            const Icon = ICONS[outcome.label] || Sparkles
            return (
              <FadeIn key={outcome.label} delay={i * 0.05}>
                <motion.div
                  className="gix-glass-dark rounded-2xl border border-white/10 p-5 h-full flex gap-4 items-start hover:border-violet-500/35 transition-colors group"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <div className="size-10 rounded-xl flex items-center justify-center shrink-0 border border-violet-500/25 bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
                    <Icon className="size-5 text-violet-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm leading-snug">{outcome.label}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{outcome.desc}</p>
                  </div>
                </motion.div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
