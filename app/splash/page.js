'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { apiGet } from '@/src/lib/api'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { COMPANY } from '@/lib/marketing-content'
import { LEADS_TOUR_URL } from '@/lib/leads/paths'

export default function SplashPage() {
  const router = useRouter()
  const authQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiGet('/auth/me'),
    retry: false,
  })

  const onboardingQuery = useQuery({
    queryKey: ['lead-onboarding-status'],
    queryFn: () => apiGet('/onboarding/lead-step'),
    enabled: !!authQuery.data,
    retry: false,
  })

  useEffect(() => {
    if (authQuery.isLoading) return
    if (authQuery.isError) {
      router.replace('/signin')
      return
    }
    if (!authQuery.data) return

    if (onboardingQuery.isLoading) return

    const state = onboardingQuery.data?.state
    if (state?.required && !state?.complete) {
      if (state.demoLeadsImported && !state.aiScoreViewed) {
        router.replace(LEADS_TOUR_URL)
      } else {
        router.replace('/onboarding')
      }
      return
    }

    router.replace('/product-selection')
  }, [
    authQuery.isLoading,
    authQuery.isError,
    authQuery.data,
    onboardingQuery.isLoading,
    onboardingQuery.data,
    router,
  ])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030712] text-white flex items-center justify-center">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-1/4 left-1/3 h-80 w-80 rounded-full bg-cyan-500/20 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-blue-600/15 blur-[90px]" />
      </div>

      <motion.div
        className="relative z-10 text-center px-6 max-w-lg"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <BrandLogo href="/" variant="compact" className="justify-center mb-10" />
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-400/90 mb-4">Loading workspace</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
          {COMPANY.name}
        </h1>
        <p className="text-slate-300 text-lg leading-relaxed">
          Business Suite — Retail, CRM & growth in one platform
        </p>
        <div className="mt-10 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-2 rounded-full bg-cyan-400"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <p className="mt-10 text-xs text-slate-500">Securing your session…</p>
      </motion.div>
    </div>
  )
}
