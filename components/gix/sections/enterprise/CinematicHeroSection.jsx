'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Play, Sparkles, Shield, TrendingUp, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HERO, HERO_TRUST_PILLS } from '@/lib/marketing-content'
import HeroImmersiveScene from '@/components/gix/three/HeroImmersiveScene'

const PILL_ICONS = {
  'AI-Powered': Sparkles,
  'Secure Cloud': Shield,
  'Built for Growth': TrendingUp,
  'DPDP Privacy First': Lock,
}

export default function CinematicHeroSection() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], [0, 50])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100vh] flex items-center overflow-hidden bg-[#030712] text-white"
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-violet-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/8 blur-[120px] rounded-full" />
      </div>

      <div className="container relative z-10 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 items-center min-h-[80vh]">
          <motion.div
            style={{ y: textY }}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-200 text-sm mb-6 backdrop-blur-sm">
              <Sparkles className="size-4 text-violet-300" />
              {HERO.eyebrow}
            </div>

            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.1rem] xl:text-[3.35rem] leading-[1.08] tracking-tight">
              {HERO.headline}{' '}
              <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {HERO.accent}
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-300/90 max-w-xl leading-relaxed">
              {HERO.subheadline}
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:from-violet-500 hover:via-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-violet-500/25 text-white"
              >
                <Link href={HERO.primaryCta.href}>
                  {HERO.primaryCta.label}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-8 border-white/25 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Link href={HERO.secondaryCta.href}>
                  <Play className="mr-2 size-4 fill-current" />
                  {HERO.secondaryCta.label}
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-10 max-w-lg">
              {HERO_TRUST_PILLS.map((pill) => {
                const Icon = PILL_ICONS[pill.label] || Sparkles
                return (
                  <div
                    key={pill.label}
                    className="gix-glass-dark rounded-xl px-3 py-3 border border-white/10 backdrop-blur-md hover:border-violet-500/30 transition-colors"
                  >
                    <Icon className="size-4 text-violet-300 mb-1.5" />
                    <p className="text-xs font-semibold text-white leading-tight">{pill.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{pill.desc}</p>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            className="relative min-h-[380px] sm:min-h-[440px] lg:min-h-[580px] rounded-3xl overflow-hidden border border-white/5 bg-[#030712]/40"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.15 }}
          >
            <HeroImmersiveScene className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/60 via-transparent to-transparent pointer-events-none" />
            <p className="absolute bottom-4 left-0 right-0 text-center text-[10px] uppercase tracking-widest text-slate-500 pointer-events-none">
              <span className="hidden lg:inline">Hover devices to slow rotation</span>
              <span className="lg:hidden">Touch & drag to explore 3D devices</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
