'use client'

import { SectionHeader, GlassCard, FadeIn } from '@/components/gix/enterprise/primitives'
import { motion, useReducedMotion } from 'framer-motion'

const AGENTS = [
  { name: 'CEO AI', role: 'Executive strategy', status: 'Active', tasks: 3, confidence: 94 },
  { name: 'Sales AI', role: 'Pipeline acceleration', status: 'Active', tasks: 12, confidence: 89 },
  { name: 'Proposal AI', role: 'Deal documentation', status: 'Review', tasks: 5, confidence: 91 },
  { name: 'Marketing AI', role: 'Campaign intelligence', status: 'Active', tasks: 8, confidence: 87 },
  { name: 'Finance AI', role: 'Revenue & billing', status: 'Active', tasks: 4, confidence: 96 },
  { name: 'Customer Success AI', role: 'Retention & NPS', status: 'Active', tasks: 7, confidence: 88 },
  { name: 'Geo Scanner AI', role: 'Territory discovery', status: 'Idle', tasks: 1, confidence: 82 },
  { name: 'Revenue AI', role: 'Forecasting', status: 'Active', tasks: 6, confidence: 93 },
  { name: 'Compliance AI', role: 'Policy & audit', status: 'Standby', tasks: 2, confidence: 97 },
  { name: 'Document AI', role: 'Contract extraction', status: 'Active', tasks: 9, confidence: 90 },
]

const STATUS_COLOR = {
  Active: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Review: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Idle: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Standby: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
}

function AgentCard({ agent, index }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.5 }}
      whileHover={reduce ? {} : { y: -4 }}
      className="gix-glass rounded-2xl border border-border p-5 hover:gix-glow transition-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="size-11 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00C6FF] flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-blue-500/30">
          {agent.name.split(' ')[0].slice(0, 2)}
        </div>
        <div>
          <p className="font-semibold text-foreground">{agent.name}</p>
          <p className="text-xs text-muted-foreground">{agent.role}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-0.5 rounded-full border ${STATUS_COLOR[agent.status]}`}>{agent.status}</span>
        <span className="text-muted-foreground">{agent.tasks} tasks</span>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Confidence</span>
          <span className="text-[hsl(var(--brand-electric))]">{agent.confidence}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#0066FF] to-[#00C6FF]"
            initial={{ width: 0 }}
            whileInView={{ width: `${agent.confidence}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 + index * 0.05 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function AIWorkforceSection() {
  return (
    <section className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0066FF]/5 to-transparent pointer-events-none" />
      <div className="container relative">
        <FadeIn>
          <SectionHeader
            eyebrow="AI Platform"
            title="Intelligence flowing across your business"
            description="AI Marketing Manager → AI Sales Manager → AI Proposal Writer → AI Inventory Intelligence → AI Revenue Analyst → AI Business Assistant."
          />
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {AGENTS.map((agent, i) => (
            <AgentCard key={agent.name} agent={agent} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
