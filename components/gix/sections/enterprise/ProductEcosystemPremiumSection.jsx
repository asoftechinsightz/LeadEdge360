'use client'

import Link from 'next/link'
import { ArrowRight, Store, Users, Radar } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { SectionHeader, FadeIn } from '@/components/gix/enterprise/primitives'
import MiniDeviceCanvas from '@/components/gix/three/MiniDeviceCanvas'
import { FLAGSHIP_PRODUCTS, PRODUCT_SCREENSHOTS } from '@/lib/marketing-content'

const PRODUCT_ICONS = {
  retailedge360: Store,
  leadedge360: Users,
  trinetra360: Radar,
}

const DEVICE_TYPES = {
  retailedge360: 'laptop',
  leadedge360: 'tablet',
  trinetra360: 'phone',
}

export default function ProductEcosystemPremiumSection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#8B5CF620,transparent_60%)] pointer-events-none" />

      <div className="container relative">
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
            <SectionHeader
              eyebrow="Product ecosystem"
              title="Our AI-Powered Product Ecosystem"
              description="RetailEdge360 and LeadEdge360 form the Business Suite. Trinetra360 is a separate enterprise observability platform."
              align="left"
              className="text-white mb-0 [&_p]:text-slate-400"
            />
            <Button asChild variant="outline" className="rounded-full shrink-0 border-white/20 bg-white/5 text-white hover:bg-white/10">
              <Link href="/products">
                View All Products <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {FLAGSHIP_PRODUCTS.map((product, i) => {
            const shot = PRODUCT_SCREENSHOTS[product.id]
            const isEnterprise = product.id === 'trinetra360'
            const Icon = PRODUCT_ICONS[product.id] || Store
            const deviceType = DEVICE_TYPES[product.id] || 'laptop'

            return (
              <FadeIn key={product.id} delay={i * 0.08}>
                <motion.div
                  className="group relative h-full"
                  whileHover={{ y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                >
                  {/* Animated glow border */}
                  <div
                    className="absolute -inset-[1px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                    style={{ background: `linear-gradient(135deg, ${product.accent}80, transparent, ${product.accent}40)` }}
                  />

                  <div
                    className={`relative gix-glass-dark rounded-3xl overflow-hidden h-full flex flex-col border backdrop-blur-xl ${
                      isEnterprise ? 'border-violet-500/30' : 'border-white/10'
                    }`}
                  >
                    <div
                      className="h-1 w-full"
                      style={{ background: `linear-gradient(90deg, ${product.accent}, transparent)` }}
                    />

                    <div className="p-6 lg:p-8 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div
                          className="size-11 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 group-hover:shadow-lg"
                          style={{
                            borderColor: `${product.accent}40`,
                            background: `linear-gradient(135deg, ${product.accent}20, transparent)`,
                            boxShadow: `0 0 24px ${product.accent}15`,
                          }}
                        >
                          <Icon className="size-5" style={{ color: product.accent }} />
                        </div>
                        {isEnterprise ? (
                          <span className="text-[10px] uppercase tracking-widest text-violet-400 px-2 py-1 rounded-full border border-violet-500/30 bg-violet-500/10">
                            Enterprise · Separate
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase tracking-widest text-cyan-400 px-2 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10">
                            Business Suite
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-2xl font-bold text-white group-hover:text-cyan-50 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm font-medium mt-1" style={{ color: product.accent }}>
                        {product.tagline}
                      </p>
                      <p className="mt-3 text-sm text-slate-400 leading-relaxed flex-1">
                        {product.shortDesc || product.message}
                      </p>

                      {shot && (
                        <div className="mt-6 group-hover:scale-[1.02] transition-transform duration-500">
                          <MiniDeviceCanvas
                            productId={product.id}
                            textureSrc={shot}
                            device={deviceType}
                            accent={product.accent}
                            className="w-full"
                          />
                        </div>
                      )}

                      <Link
                        href={product.href}
                        className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium transition-all group-hover:gap-2.5"
                        style={{ color: product.accent }}
                      >
                        Learn More <ArrowRight className="size-4" />
                      </Link>
                    </div>
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
