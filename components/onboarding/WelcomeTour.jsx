'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TOUR_KEY = 'asoftech_welcome_tour_v1'

const STEPS = [
  {
    title: 'Welcome to Business Suite',
    body: 'RetailEdge360 and LeadEdge360 share one secure workspace. Pick the product that matches how you run your business today.',
  },
  {
    title: 'RetailEdge360',
    body: 'GST billing, POS, inventory, barcode scanning, and store analytics — built for kirana stores, pharmacies, and retail chains.',
  },
  {
    title: 'LeadEdge360',
    body: 'CRM, sales pipeline, AI lead scoring, proposals, and email campaigns — for SMEs, agencies, and sales teams.',
  },
  {
    title: 'Switch anytime',
    body: 'You can move between products from the app menu. Your organization data stays in one tenant with role-based access.',
  },
]

export function WelcomeTour({ onDismiss }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      if (localStorage.getItem(TOUR_KEY) !== '1') setOpen(true)
    } catch {
      setOpen(true)
    }
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(TOUR_KEY, '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
    onDismiss?.()
  }

  function next() {
    if (step >= STEPS.length - 1) {
      dismiss()
      return
    }
    setStep((s) => s + 1)
  }

  if (!open) return null

  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a1628] to-[#050a1f] p-8 shadow-2xl"
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        role="dialog"
        aria-labelledby="welcome-tour-title"
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="Close tour"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-2 text-cyan-400 mb-4">
          <Sparkles className="size-4" />
          <span className="text-xs uppercase tracking-widest">Quick tour · Step {step + 1} of {STEPS.length}</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h2 id="welcome-tour-title" className="font-display text-2xl font-bold text-white">
              {current.title}
            </h2>
            <p className="mt-3 text-slate-300 leading-relaxed">{current.body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-cyan-400' : 'bg-white/10'}`}
            />
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Button type="button" variant="ghost" className="text-slate-400" onClick={dismiss}>
            Skip tour
          </Button>
          <Button type="button" className="flex-1 rounded-full bg-cyan-600 hover:bg-cyan-500" onClick={next}>
            {step >= STEPS.length - 1 ? 'Choose a product' : 'Next'}
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default WelcomeTour
