'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Button } from '@/components/design-system/core/Button'
import { Input } from '@/components/design-system/core/Input'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LeadTable } from './LeadTable'
import { LeadCaptureDialog } from './LeadCaptureDialog'
import { LABELS, STATUSES } from './constants'
import { ChevronLeft, ChevronRight, Plus, Zap } from 'lucide-react'
import { toast } from 'sonner'
import GuidedTour from '@/components/onboarding/GuidedTour'
import { LeadsZeroBanner } from '@/components/leads/LeadsZeroBanner'

export function LeadsManagement() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [label, setLabel] = useState('all')
  const [search, setSearch] = useState('')
  const [captureOpen, setCaptureOpen] = useState(false)
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    if (searchParams?.get('new') === '1') {
      setCaptureOpen(true)
    }
    if (searchParams?.get('tour') === '1') {
      setShowTour(true)
    }
  }, [searchParams])

  const params = useMemo(() => {
    const p = { page, limit: 20 }
    if (status !== 'all') p.status = status
    if (label !== 'all') p.label = label
    if (search.trim()) p.q = search.trim()
    return p
  }, [page, status, label, search])

  const leadsQuery = useQuery({
    queryKey: ['sales-leads', params],
    queryFn: () => apiGet('/sales/leads', params),
  })

  const queryClient = useQueryClient()

  const queueHotMutation = useMutation({
    mutationFn: () => apiPost('/sales/leads/bulk-workflow', { minScore: 80, limit: 50 }),
    onSuccess: (data) => {
      const msg = `Queued ${data?.assigned ?? 0} leads · ${data?.followupsCreated ?? 0} follow-ups · ${data?.tasksCreated ?? 0} tasks`
      if ((data?.assigned ?? 0) === 0 && (data?.matched ?? 0) === 0) {
        toast.info('No unassigned Hot leads found')
      } else {
        toast.success(msg)
      }
      queryClient.invalidateQueries({ queryKey: ['sales-leads'] })
    },
    onError: (e) => toast.error(e.message || 'Failed to queue Hot leads'),
  })

  const data = leadsQuery.data
  const items = data?.items || []

  async function completeOnboardingTour() {
    try {
      await apiPost('/onboarding/lead-step', { step: 3 })
      queryClient.invalidateQueries({ queryKey: ['lead-onboarding-status'] })
      toast.success('Setup complete — welcome to LeadEdge360!')
      setShowTour(false)
    } catch (e) {
      toast.error(e.message || 'Could not save progress')
    }
  }

  return (
    <div className="container py-10">
      {showTour && (
        <GuidedTour forceOpen onComplete={completeOnboardingTour} />
      )}
      <PageHeader
        title="Leads Management"
        description="Search, filter, and manage your sales leads."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              disabled={queueHotMutation.isPending}
              onClick={() => queueHotMutation.mutate()}
            >
              <Zap className="h-4 w-4 mr-1" />
              {queueHotMutation.isPending ? 'Queuing…' : 'Queue Hot Leads'}
            </Button>
            <Button className="rounded-full" data-tour="create-lead" onClick={() => setCaptureOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> New lead
            </Button>
          </div>
        }
      />

      {!leadsQuery.isLoading && items.length === 0 && (
        <LeadsZeroBanner onDemoLoaded={() => leadsQuery.refetch()} />
      )}

      <Card className="bg-card/60 border-border/60 mb-6">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <Input
            placeholder="Search name, company, phone…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="max-w-xs"
            aria-label="Search leads"
          />
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
            <SelectTrigger className="w-[150px]" aria-label="Filter leads by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={label} onValueChange={(v) => { setLabel(v); setPage(1) }}>
            <SelectTrigger className="w-[150px]" aria-label="Filter leads by label">
              <SelectValue placeholder="Label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All labels</SelectItem>
              {LABELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/60">
        <CardContent className="p-0">
          {leadsQuery.isLoading ? (
            <div className="p-6"><LoadingState label="Loading leads…" rows={4} /></div>
          ) : (
            <LeadTable leads={items} onEmptyAction={() => leadsQuery.refetch()} />
          )}
        </CardContent>
      </Card>

      {data?.pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span className="text-muted-foreground">
            Page {data.page} of {data.pages} · {data.total} total
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <LeadCaptureDialog open={captureOpen} onOpenChange={setCaptureOpen} onSuccess={() => leadsQuery.refetch()} />
    </div>
  )
}
