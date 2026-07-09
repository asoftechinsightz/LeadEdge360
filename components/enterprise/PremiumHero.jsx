'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Play, Sparkles, TrendingUp, Package, Users, Smartphone } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/gix/enterprise/primitives'
import { TrustBadges } from '@/components/enterprise/TrustBadges'
import {
  HERO,
  LEADEDGE_MARKETING,
  RETAIL_MARKETING,
  TRINETRA_MARKETING,
  PRODUCT_SCREENSHOTS,
} from '@/lib/marketing-content'
import { BRAND_LOGOS } from '@/lib/brand'

const HeroEcosystemScene = dynamic(
  () => import('@/components/gix/three/HeroEcosystemScene'),
  { ssr: false },
)

const PRODUCTS = [
  { id: 'leadedge360', ...LEADEDGE_MARKETING, logo: BRAND_LOGOS.leadedge360, accent: '#0066FF' },
  { id: 'retailedge360', ...RETAIL_MARKETING, logo: BRAND_LOGOS.retailedge360, accent: '#FF7A00' },
  { id: 'trinetra360', ...TRINETRA_MARKETING, logo: BRAND_LOGOS.master, accent: '#8B5CF6' },
]

const KPI_CARDS = {
  leadedge360: [
    { label: 'Pipeline value', value: '₹2.4Cr', icon: TrendingUp },
    { label: 'Hot leads', value: '128', icon: Users },
    { label: 'Win rate', value: '+34%', icon: Sparkles },
  ],
  retailedge360: [
    { label: 'SKUs tracked', value: '12.4K', icon: Package },
    { label: 'Expiry saved', value: '₹8.2L', icon: TrendingUp },
    { label: 'Stores live', value: '24', icon: Users },
  ],
  trinetra360: [
    { label: 'Availability', value: '99.94%', icon: TrendingUp },
    { label: 'Compliance', value: '87/100', icon: Sparkles },
    { label: 'Incidents', value: '0 open', icon: Users },
  ],
}

/**
 * Premium enterprise hero — homepage (dual product) or inner marketing pages.
 */
export default function PremiumHero({
  variant = 'homepage',
  eyebrow,
  title,
  accent,
  description,
  productId = 'leadedge360',
  screenshot,
  ctaHref = HERO.primaryCta?.href ?? '/book-demo',
  ctaLabel = HERO.primaryCta?.label ?? 'Book Demo',
  secondaryHref = HERO.secondaryCta?.href ?? '/products',
  secondaryLabel = HERO.secondaryCta?.label ?? 'Explore Products',
  showProductSwitcher = variant === 'homepage',
  showMobileMockup = true,
  show3dBackground = variant === 'homepage',
}) {
  const [active, setActive] = useState(productId)
  const product = PRODUCTS.find((p) => p.id === active) || PRODUCTS[0]
  const kpis = KPI_CARDS[active] || []
  const dashboardSrc = screenshot || PRODUCT_SCREENSHOTS[active]

  const headline = title ?? HERO.headline
  const headlineAccent = accent ?? HERO.accent
  const subtext = description ?? HERO.subheadline
  const badge = eyebrow ?? 'AI-Powered Business Growth Platform'

  return (
    <section className="relative overflow-hidden gix-premium-hero-bg min-h-[520px]">
      {show3dBackground && (
        <HeroEcosystemScene className="absolute inset-0 z-0 opacity-75 pointer-events-none min-h-[520px]" />
      )}
      <div className="absolute inset-0 gix-hero-grid opacity-25 pointer-events-none z-[1]" aria-hidden />

      <div className="container relative z-10 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <FadeIn priority>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-white/90 text-sm text-[hsl(var(--brand-electric))] mb-6 shadow-sm backdrop-blur-sm">
              <Sparkles className="size-4" />
              {badge}
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl xl:text-[3.75rem] leading-[1.08] text-foreground tracking-tight">
              {headline}
              {headlineAccent && (
                <>
                  <br />
                  <span className="gradient-text">{headlineAccent}</span>
                </>
              )}
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              {subtext}
            </p>

            {showProductSwitcher && (
              <>
                <div className="flex flex-wrap gap-2 mt-8">
                  {PRODUCTS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActive(p.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        active === p.id
                          ? 'bg-[hsl(var(--brand-electric))] border-[hsl(var(--brand-electric))] text-white shadow-md shadow-blue-500/20'
                          : 'bg-white border-border text-muted-foreground hover:border-[hsl(var(--brand-electric))]/40 hover:text-foreground'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="mt-5 gix-glass rounded-2xl p-5"
                  >
                    <Image src={product.logo} alt="" width={140} height={36} className="h-9 w-auto object-contain" />
                    <p className="text-sm font-medium text-[hsl(var(--brand-electric))] mt-3">{product.tagline}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {product.highlights.slice(0, 6).map((h) => (
                        <li key={h} className="text-xs px-2.5 py-1 rounded-full bg-secondary border border-border text-muted-foreground">
                          {h}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={product.href}
                      className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-[hsl(var(--brand-electric))] hover:underline"
                    >
                      Explore {product.name} <ArrowRight className="size-3.5" />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </>
            )}

            <div className="flex flex-wrap gap-3 mt-8">
              <Button asChild size="lg" className="rounded-full px-8 bg-[#0066FF] hover:bg-[#00C6FF] text-white shadow-lg shadow-blue-500/20">
                <Link href={ctaHref}>
                  {ctaLabel}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 border-border bg-white hover:bg-secondary">
                <Link href={secondaryHref}>
                  {variant === 'homepage' && secondaryLabel.toLowerCase().includes('watch') ? (
                    <>
                      <Play className="mr-2 size-4" />
                      {secondaryLabel}
                    </>
                  ) : (
                    secondaryLabel
                  )}
                </Link>
              </Button>
            </div>

            <TrustBadges className="mt-8" compact />
          </FadeIn>

          <FadeIn priority delay={0.12} className="relative">
            <div className="relative mx-auto max-w-xl lg:max-w-none">
              {/* Laptop / dashboard mockup */}
              <div className="gix-device-frame gix-glow">
                <div className="gix-device-notch">
                  <span className="gix-device-dot" />
                  <span className="gix-device-dot" />
                  <span className="gix-device-dot" />
                  <span className="ml-2 text-[10px] text-muted-foreground truncate flex-1">
                    {product.name} — Live Dashboard
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-medium">
                    AI Active
                  </span>
                </div>
                <div className="relative aspect-[16/10] bg-secondary/30">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={active}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={dashboardSrc}
                        alt={`${product.name} dashboard`}
                        fill
                        className="object-cover object-top"
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Floating KPI cards */}
              {kpis.map((kpi, i) => {
                const Icon = kpi.icon
                const positions = [
                  'absolute -top-4 -left-2 lg:-left-6 z-20',
                  'absolute top-1/3 -right-2 lg:-right-8 z-20',
                  'absolute -bottom-4 left-8 z-20',
                ]
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.1 }}
                    className={`${positions[i]} gix-glass gix-float rounded-xl px-4 py-3 shadow-lg hidden sm:block`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-[hsl(var(--brand-electric))]/10 grid place-items-center">
                        <Icon className="size-4 text-[hsl(var(--brand-electric))]" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                        <p className="text-base font-bold" style={{ color: product.accent }}>{kpi.value}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* Mobile mockup */}
              {showMobileMockup && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -bottom-6 -right-2 lg:right-4 w-[100px] sm:w-[120px] z-30 hidden md:block"
                >
                  <div className="rounded-[20px] border-4 border-slate-800 bg-slate-900 p-1 shadow-2xl">
                    <div className="rounded-[14px] overflow-hidden aspect-[9/16] bg-white relative">
                      <Image
                        src={dashboardSrc}
                        alt={`${product.name} mobile`}
                        fill
                        className="object-cover object-top scale-150"
                        sizes="120px"
                      />
                    </div>
                  </div>
                  <div className="absolute -top-2 -left-2 gix-glass rounded-lg px-2 py-1 flex items-center gap-1 text-[9px] text-muted-foreground shadow-md">
                    <Smartphone className="size-3 text-[hsl(var(--brand-electric))]" />
                    Mobile App
                  </div>
                </motion.div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
