'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TOUR_KEY = 'leadedge_guided_tour_v1'

export type GuidedTourStep = {
  key: string
  title: string
  body: string
  selector: string
}

const DEFAULT_STEPS: GuidedTourStep[] = [
  {
    key: 'leads_tab',
    title: 'Your Leads workspace',
    body: 'All imported and captured leads live here. Use filters and search to find hot prospects fast.',
    selector: '[data-tour="leads-tab"]',
  },
  {
    key: 'create_lead',
    title: 'Create your first lead',
    body: 'Tap New lead anytime to capture inquiries from calls, WhatsApp, or walk-ins.',
    selector: '[data-tour="create-lead"]',
  },
  {
    key: 'ai_score',
    title: 'AI lead score',
    body: 'Each lead gets an AI score and label (Hot / Warm / Cold) so your team prioritizes the right deals.',
    selector: '[data-tour="ai-score"]',
  },
]

type Rect = { top: number; left: number; width: number; height: number }

function measureTarget(selector: string): Rect | null {
  if (typeof document === 'undefined') return null
  const el = document.querySelector(selector)
  if (!el) return null
  const box = el.getBoundingClientRect()
  const pad = 8
  return {
    top: Math.max(8, box.top - pad),
    left: Math.max(8, box.left - pad),
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  }
}

export type GuidedTourProps = {
  steps?: GuidedTourStep[]
  storageKey?: string
  onComplete?: () => void
  /** When true, ignore localStorage and show tour */
  forceOpen?: boolean
}

export function GuidedTour({
  steps = DEFAULT_STEPS,
  storageKey = TOUR_KEY,
  onComplete,
  forceOpen = false,
}: GuidedTourProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [spotlight, setSpotlight] = useState<Rect | null>(null)

  const refreshSpotlight = useCallback(() => {
    const current = steps[step]
    if (!current) return
    setSpotlight(measureTarget(current.selector))
  }, [step, steps])

  useEffect(() => {
    if (forceOpen) {
      setOpen(true)
      return
    }
    try {
      if (localStorage.getItem(storageKey) !== '1') setOpen(true)
    } catch {
      setOpen(true)
    }
  }, [forceOpen, storageKey])

  useEffect(() => {
    if (!open) return
    refreshSpotlight()
    const onResize = () => refreshSpotlight()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    const t = window.setTimeout(refreshSpotlight, 120)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
      window.clearTimeout(t)
    }
  }, [open, step, refreshSpotlight])

  function dismiss(markComplete = false) {
    try {
      if (markComplete) localStorage.setItem(storageKey, '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
    if (markComplete) onComplete?.()
  }

  function next() {
    if (step >= steps.length - 1) {
      dismiss(true)
      return
    }
    setStep((s) => s + 1)
  }

  if (!open) return null

  const current = steps[step]

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] pointer-events-auto" aria-hidden />

      {spotlight && (
        <motion.div
          className="absolute rounded-xl ring-2 ring-cyan-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] pointer-events-none"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        />
      )}

      <motion.div
        className="pointer-events-auto absolute left-1/2 bottom-8 w-[min(100%,28rem)] -translate-x-1/2 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a1628] to-[#050a1f] p-6 shadow-2xl mx-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        role="dialog"
        aria-labelledby="guided-tour-title"
      >
        <button
          type="button"
          onClick={() => dismiss(false)}
          className="absolute right-3 top-3 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="Close tour"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-2 text-cyan-400 mb-3">
          <Sparkles className="size-4" />
          <span className="text-xs uppercase tracking-widest">
            Guided tour · Step {step + 1} of {steps.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h2 id="guided-tour-title" className="font-display text-xl font-bold text-white pr-8">
              {current.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">{current.body}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex gap-1">
          {steps.map((s, i) => (
            <span
              key={s.key}
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-cyan-400' : 'bg-white/10'}`}
            />
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <Button type="button" variant="ghost" className="text-slate-400" onClick={() => dismiss(false)}>
            Skip
          </Button>
          <Button type="button" className="flex-1 rounded-full bg-cyan-600 hover:bg-cyan-500" onClick={next}>
            {step >= steps.length - 1 ? 'Got it' : 'Next'}
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default GuidedTour
