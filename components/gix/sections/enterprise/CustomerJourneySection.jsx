'use client'

import { SectionHeader, FadeIn } from '@/components/gix/enterprise/primitives'
import { motion } from 'framer-motion'

const STEPS = [
  'Lead',
  'Qualification AI',
  'Opportunity',
  'Proposal AI',
  'Approval',
  'Invoice',
  'Finance AI',
  'Customer Success',
  'Renewal',
  'Executive Insights',
]

export default function CustomerJourneySection() {
  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Lifecycle"
            title="End-to-end customer journey"
            description="From first touch to renewal — orchestrated by AI agents with human oversight at critical gates."
          />
        </FadeIn>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#0066FF] via-[#00C6FF] to-transparent -translate-x-1/2 hidden md:block" />
          <div className="space-y-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-center gap-4 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div className="inline-block gix-glass rounded-xl border border-border px-5 py-3 hover:gix-glow transition-shadow">
                    <p className="font-medium text-foreground">{step}</p>
                  </div>
                </div>
                <div className="hidden md:flex size-3 rounded-full bg-[#00C6FF] shadow-lg shadow-cyan-500/50 shrink-0 z-10" />
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
