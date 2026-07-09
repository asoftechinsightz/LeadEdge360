'use client'

import { SectionHeader, FadeIn } from '@/components/gix/enterprise/primitives'
import { motion } from 'framer-motion'

const MILESTONES = [
  { year: '2026 Q1', title: 'LeadEdge360', desc: 'AI-native CRM & revenue platform GA' },
  { year: '2026 Q2', title: 'RetailEdge360', desc: 'Omnichannel retail intelligence' },
  { year: '2026 Q3', title: 'AI Workforce', desc: '12-agent enterprise runtime' },
  { year: '2026 Q4', title: 'Observability Platform', desc: 'Full-stack ops & event intelligence' },
  { year: '2027', title: 'Industry AI Solutions', desc: 'Vertical packs for BFSI, healthcare, gov' },
  { year: '2027+', title: 'Global Expansion', desc: 'Multi-region enterprise deployments' },
]

export default function InnovationTimelineSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Roadmap"
            title="AI innovation timeline"
            description="Our path from intelligent CRM to global Agentic AI enterprise platform."
          />
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {MILESTONES.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="gix-glass rounded-2xl border border-border p-6 relative overflow-hidden group hover:gix-glow transition-shadow"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0066FF] to-[#00C6FF] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              <p className="text-xs font-mono text-[hsl(var(--brand-electric))]">{m.year}</p>
              <h3 className="font-semibold text-lg text-foreground mt-2">{m.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
