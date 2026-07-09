'use client'

import { useState } from 'react'
import { SectionHeader, GlassCard, FadeIn } from '@/components/gix/enterprise/primitives'
import { motion, AnimatePresence } from 'framer-motion'

const INDUSTRIES = {
  bfsi: {
    label: 'BFSI',
    headline: 'Risk-aware growth for banking & insurance',
    agents: ['Compliance AI', 'Finance AI', 'Proposal AI'],
    highlight: 'Automated KYC workflows, revenue forecasting, and regulatory-ready proposals.',
  },
  retail: {
    label: 'Retail',
    headline: 'Omnichannel retail intelligence',
    agents: ['Marketing AI', 'Geo Scanner AI', 'Customer Success AI'],
    highlight: 'Campaign automation, store-level analytics, and loyalty retention at scale.',
  },
  healthcare: {
    label: 'Healthcare',
    headline: 'Patient-centric engagement platform',
    agents: ['Document AI', 'Customer Success AI', 'Meeting Scheduler AI'],
    highlight: 'Secure document processing, appointment orchestration, and care follow-ups.',
  },
  manufacturing: {
    label: 'Manufacturing',
    headline: 'Industrial pipeline & partner growth',
    agents: ['Sales AI', 'Proposal AI', 'Revenue AI'],
    highlight: 'B2B lead qualification, tender proposals, and supply-chain revenue visibility.',
  },
  government: {
    label: 'Government',
    headline: 'Public sector digital transformation',
    agents: ['Compliance AI', 'Document AI', 'CEO AI'],
    highlight: 'Policy compliance, tender documentation, and executive reporting dashboards.',
  },
  education: {
    label: 'Education',
    headline: 'EdTech enrollment & retention',
    agents: ['Marketing AI', 'Lead Qualification AI', 'Customer Success AI'],
    highlight: 'Inquiry nurturing, demo scheduling, and student lifecycle management.',
  },
  it_services: {
    label: 'IT Services',
    headline: 'Services-led revenue acceleration',
    agents: ['Proposal AI', 'Sales AI', 'Revenue Intelligence AI'],
    highlight: 'Discovery-to-delivery pipeline, SOW automation, and margin analytics.',
  },
  hospitality: {
    label: 'Hospitality',
    headline: 'Guest experience & booking growth',
    agents: ['Marketing AI', 'Customer Success AI', 'Meeting Scheduler AI'],
    highlight: 'Campaign personalization, review management, and booking follow-ups.',
  },
  logistics: {
    label: 'Logistics',
    headline: 'Network growth & partner CRM',
    agents: ['Geo Scanner AI', 'Sales AI', 'Finance AI'],
    highlight: 'Territory expansion, freight partner pipelines, and billing automation.',
  },
}

export default function IndustrySelectorSection() {
  const keys = Object.keys(INDUSTRIES)
  const [active, setActive] = useState('it_services')
  const industry = INDUSTRIES[active]

  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Industries"
            title="Solutions tailored to your sector"
            description="Select an industry to see recommended AI workforce, solution highlights, and growth playbooks."
          />
        </FadeIn>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {keys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active === key
                  ? 'bg-[hsl(var(--brand-royal))] text-white shadow-lg shadow-blue-500/30'
                  : 'border border-border bg-secondary text-muted-foreground hover:bg-white'
              }`}
            >
              {INDUSTRIES[key].label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
          >
            <GlassCard className="p-8 md:p-12 gix-glow max-w-4xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">{industry.headline}</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">{industry.highlight}</p>
              <div className="mt-8">
                <p className="text-xs uppercase tracking-widest text-[hsl(var(--brand-electric))] mb-3">Recommended AI workforce</p>
                <div className="flex flex-wrap gap-2">
                  {industry.agents.map((a) => (
                    <span key={a} className="px-3 py-1.5 rounded-lg border border-border bg-secondary text-sm text-foreground">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
