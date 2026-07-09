'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Store, Bot, Radar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FLAGSHIP_PRODUCTS, PRODUCT_SCREENSHOTS } from '@/lib/marketing-content'
import { SectionHeader, GlassCard, FadeIn } from '@/components/gix/enterprise/primitives'

const ICONS = { store: Store, crm: Bot, observability: Radar }

const SCREENSHOTS = {
  retailedge360: PRODUCT_SCREENSHOTS.retailedge360,
  leadedge360: PRODUCT_SCREENSHOTS.leadedge360,
  trinetra360: null,
}

export default function FlagshipProductsSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <FadeIn>
          <SectionHeader
            eyebrow="Flagship Products"
            title="Three platforms. One intelligent ecosystem."
            description="RetailEdge360, LeadEdge360, and Trinetra360 — designed to work together for operations, revenue, and reliability."
          />
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-8 mt-12">
          {FLAGSHIP_PRODUCTS.map((product, i) => {
            const Icon = ICONS[product.icon] || Bot
            const shot = SCREENSHOTS[product.id]
            return (
              <FadeIn key={product.id} delay={i * 0.08}>
                <GlassCard className="overflow-hidden h-full flex flex-col p-0">
                  <div
                    className="h-1.5 w-full"
                    style={{ background: `linear-gradient(90deg, ${product.accent}, transparent)` }}
                  />
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl border border-border bg-white">
                        <Icon className="size-5" style={{ color: product.accent }} />
                      </div>
                      {product.status === 'early-access' && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-violet-500/15 text-violet-700">
                          Early Access
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-2xl font-bold">{product.name}</h3>
                    <p className="text-sm font-medium mt-1" style={{ color: product.accent }}>
                      {product.tagline}
                    </p>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed flex-1">
                      {product.message}
                    </p>
                    {shot && (
                      <div className="mt-6 rounded-lg overflow-hidden border border-border gix-device-frame">
                        <Image src={shot} alt={`${product.name} dashboard`} width={800} height={500} className="w-full h-auto" />
                      </div>
                    )}
                    {!shot && (
                      <div className="mt-6 rounded-lg border border-dashed border-border bg-[#050d1f] p-8 text-center">
                        <Radar className="size-10 mx-auto text-violet-400/80 mb-2" />
                        <p className="text-xs text-muted-foreground">NOC-style observability UI — demo on request</p>
                      </div>
                    )}
                    <Button asChild className="rounded-full mt-6 w-full" style={{ backgroundColor: product.accent }}>
                      <Link href={product.href}>
                        Explore {product.name} <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                  </div>
                </GlassCard>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
