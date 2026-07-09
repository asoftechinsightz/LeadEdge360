'use client'

import { useState } from 'react'
import { SectionHeader, FadeIn } from '@/components/gix/enterprise/primitives'
import { motion } from 'framer-motion'

const LAYERS = [
  { id: 'users', label: 'Enterprise Users', desc: 'Executives, sales, ops & partners' },
  { id: 'leadedge', label: 'LeadEdge360', desc: 'CRM, proposals, invoices, campaigns' },
  { id: 'runtime', label: 'Agent Runtime', desc: 'Task queue, skills, approvals' },
  { id: 'workforce', label: 'AI Workforce', desc: '12+ specialized virtual employees' },
  { id: 'events', label: 'Platform Event Bus', desc: 'Real-time domain events & webhooks' },
  { id: 'observability', label: 'Observability', desc: 'Health, traces, audit & alerts' },
  { id: 'analytics', label: 'Analytics', desc: 'Revenue, pipeline & executive KPIs' },
  { id: 'cloud', label: 'Cloud Infrastructure', desc: 'MongoDB, Docker, secure VPS / cloud' },
]

export default function ArchitectureSection() {
  const [hovered, setHovered] = useState(null)

  return (
    <section className="py-24 lg:py-32">
      <div className="container max-w-3xl">
        <FadeIn>
          <SectionHeader
            eyebrow="Architecture"
            title="Enterprise-grade AI platform stack"
            description="Layered architecture built for scale, security, and agentic automation."
          />
        </FadeIn>

        <div className="space-y-0">
          {LAYERS.map((layer, i) => (
            <div key={layer.id}>
              <motion.div
                onHoverStart={() => setHovered(layer.id)}
                onHoverEnd={() => setHovered(null)}
                animate={{
                  scale: hovered === layer.id ? 1.02 : 1,
                  borderColor: hovered === layer.id ? 'rgba(0,198,255,0.5)' : 'rgba(255,255,255,0.1)',
                }}
                className="gix-glass rounded-xl border p-5 cursor-default transition-shadow"
                style={{ boxShadow: hovered === layer.id ? '0 0 40px rgba(0,102,255,0.2)' : 'none' }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-[hsl(var(--brand-electric))] w-6">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="font-semibold text-foreground">{layer.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{layer.desc}</p>
                  </div>
                </div>
              </motion.div>
              {i < LAYERS.length - 1 && (
                <div className="flex justify-center py-2 text-muted-foreground/40 text-lg">↓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
