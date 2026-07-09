'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SectionHeader, FadeIn } from '@/components/gix/enterprise/primitives'
import { PRODUCT_GALLERY, LEADEDGE_MARKETING, RETAIL_MARKETING } from '@/lib/marketing-content'
import { DeviceShowcase } from '@/components/marketing/DeviceMockup'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { id: 'leadedge360', label: 'LeadEdge360', product: LEADEDGE_MARKETING, glow: 'cyan' },
  { id: 'retailedge360', label: 'RetailEdge360', product: RETAIL_MARKETING, glow: 'orange' },
]

export default function DashboardPreviewSection() {
  const [active, setActive] = useState('leadedge360')
  const tab = TABS.find((t) => t.id === active) || TABS[0]
  const gallery = PRODUCT_GALLERY[active] || []
  const [shotIndex, setShotIndex] = useState(0)
  const currentShot = gallery[shotIndex] || gallery[0]

  return (
    <section className="py-24 lg:py-32 overflow-hidden">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Product showcase"
            title="Live dashboards in premium device frames"
            description="Real application screenshots from LeadEdge360 and RetailEdge360 — not mockups. The same interfaces your team uses every day."
          />
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActive(t.id)
                  setShotIndex(0)
                }}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                  active === t.id
                    ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-md shadow-blue-500/20'
                    : 'bg-white border-border text-muted-foreground hover:border-[#0066FF]/40'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {gallery.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {gallery.map((shot, i) => (
                <button
                  key={shot.label}
                  type="button"
                  onClick={() => setShotIndex(i)}
                  className={`px-4 py-1.5 rounded-full text-xs border transition-all ${
                    shotIndex === i
                      ? 'bg-white/10 border-[#0066FF]/50 text-white'
                      : 'border-white/10 text-muted-foreground hover:border-white/20'
                  }`}
                >
                  {shot.label}
                </button>
              ))}
            </div>
          )}

          <div className="relative max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6 px-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-[hsl(var(--brand-electric))]">{tab.product.name}</p>
                <p className="text-sm text-muted-foreground">{currentShot?.label || tab.product.tagline}</p>
              </div>
              <Link
                href={tab.product.href}
                className="text-xs text-[hsl(var(--brand-electric))] hover:underline inline-flex items-center gap-1"
              >
                Explore product <ArrowRight className="size-3" />
              </Link>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${active}-${shotIndex}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
              >
                {currentShot ? (
                  <DeviceShowcase
                    src={currentShot.src}
                    alt={`${tab.product.name} — ${currentShot.label}`}
                    glow={tab.glow}
                  />
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-[#0a1628] aspect-video">
                    <Image
                      src={tab.product.screenshots?.[0]?.href || '/images/products/leadedge360-dashboard.svg'}
                      alt={`${tab.product.name} dashboard`}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
