'use client'

import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { Plus, Database, Loader2 } from 'lucide-react'
import { Button } from '@/components/design-system/core/Button'
import { apiPost } from '@/src/lib/api'
import { LEADS_NEW_URL } from '@/lib/leads/paths'
import { toast } from 'sonner'

type LeadsZeroBannerProps = {
  onDemoLoaded?: () => void
}

/** Shown above the leads table when count is zero — quick activation CTAs. */
export function LeadsZeroBanner({ onDemoLoaded }: LeadsZeroBannerProps) {
  const demoMutation = useMutation({
    mutationFn: () => apiPost('/leads/demo-data', {}),
    onSuccess: (data) => {
      toast.success(data.message || 'Demo data loaded')
      onDemoLoaded?.()
    },
    onError: (err: { message?: string }) => toast.error(err.message || 'Could not load demo data'),
  })

  return (
    <div
      className="mb-4 flex flex-col gap-3 rounded-xl border border-cyan-500/25 bg-gradient-to-r from-cyan-500/10 to-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      role="status"
    >
      <div>
        <p className="text-sm font-semibold">Add your first lead</p>
        <p className="text-xs text-muted-foreground">
          Capture a real lead or load industry-matched demo data to explore AI scoring and automations.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link href={LEADS_NEW_URL}>
            <Plus className="size-4 mr-1.5" />
            New lead
          </Link>
        </Button>
        <Button
          size="sm"
          className="rounded-full"
          disabled={demoMutation.isPending}
          onClick={() => demoMutation.mutate()}
        >
          {demoMutation.isPending ? (
            <Loader2 className="size-4 mr-1.5 animate-spin" />
          ) : (
            <Database className="size-4 mr-1.5" />
          )}
          Load Demo Data
        </Button>
      </div>
    </div>
  )
}

export default LeadsZeroBanner
