'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { PipelineBoard } from '@/components/leadedge360'
import { OpportunityCreateDialog } from '@/components/suite/CreateEntityDialogs'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { KPICard } from '@/components/design-system/core/KPICard'
import { BriefcaseBusiness, Target, TrendingUp, XCircle } from 'lucide-react'

export default function OpportunitiesPage() {
  const searchParams = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (searchParams?.get('new') === '1') setCreateOpen(true)
  }, [searchParams])
  const dashboardQuery = useQuery({
    queryKey: ['opportunities', 'dashboard'],
    queryFn: () => apiGet('/opportunities/dashboard'),
  })

  const pipelineQuery = useQuery({
    queryKey: ['opportunities', 'pipeline'],
    queryFn: () => apiGet('/opportunities/pipeline'),
  })

  const dashboard = dashboardQuery.data
  const pipelineItems = pipelineQuery.data?.items || []

  return (
    <div className="space-y-8">
      <PageHeader
        title="Opportunity Pipeline"
        description="Drag opportunities between stages. Updates sync lead status, opportunity stage, revenue, and activity timeline."
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total" value={dashboard?.total ?? '—'} icon={<BriefcaseBusiness className="size-5" />} />
        <KPICard label="Won" value={dashboard?.won ?? '—'} icon={<TrendingUp className="size-5" />} />
        <KPICard label="Lost" value={dashboard?.lost ?? '—'} icon={<XCircle className="size-5" />} />
        <KPICard
          label="Pipeline value"
          value={dashboard?.pipelineValue != null ? `₹${Number(dashboard.pipelineValue).toLocaleString()}` : '—'}
          icon={<Target className="size-5" />}
        />
      </div>

      <Card className="bg-card/60 border-border/60">
        <CardContent className="p-4">
          {pipelineQuery.isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading pipeline…</div>
          ) : (
            <PipelineBoard items={pipelineItems} queryKey={['opportunities', 'pipeline']} />
          )}
        </CardContent>
      </Card>

      <OpportunityCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          dashboardQuery.refetch()
          pipelineQuery.refetch()
        }}
      />
    </div>
  )
}
