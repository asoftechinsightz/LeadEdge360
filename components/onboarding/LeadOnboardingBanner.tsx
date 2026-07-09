'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { Button } from '@/components/ui/button'
import { LEADS_TOUR_URL } from '@/lib/leads/paths'

/**
 * Persistent CTA until LeadEdge360 onboarding step 3 is complete.
 */
export function LeadOnboardingBanner() {
  const statusQuery = useQuery({
    queryKey: ['lead-onboarding-status'],
    queryFn: () => apiGet('/onboarding/lead-step'),
    staleTime: 30_000,
    retry: false,
  })

  const state = statusQuery.data?.state
  if (!state?.required || state.complete) return null

  const step = state.currentStep || 1
  const href = step >= 3 ? LEADS_TOUR_URL : '/onboarding'
  const label =
    step >= 3
      ? 'View AI scores to finish setup'
      : step === 2
        ? 'Import demo leads to continue'
        : 'Create first lead — finish setup'

  return (
    <div
      className="mb-4 flex flex-col gap-3 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-cyan-500/15 p-2 text-cyan-500">
          {step >= 3 ? <Sparkles className="size-4" /> : <UserPlus className="size-4" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            Step {Math.min(step, 3)} of 3 · {state.percent || 0}% complete — unlock your dashboard in minutes.
          </p>
        </div>
      </div>
      <Button asChild size="sm" className="rounded-full shrink-0">
        <Link href={href}>
          Continue setup
          <ArrowRight className="ml-1.5 size-4" />
        </Link>
      </Button>
    </div>
  )
}

export default LeadOnboardingBanner
