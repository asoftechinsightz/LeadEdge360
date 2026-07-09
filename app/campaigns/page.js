'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { CampaignTable } from '@/components/suite/CampaignTable'
import { CampaignCreateDialog } from '@/components/suite/CreateEntityDialogs'
import { CampaignBuilder } from '@/components/marketing/CampaignBuilder'

export default function CampaignsPage() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (searchParams?.get('new') === '1') setCreateOpen(true)
  }, [searchParams])

  const campaignsQuery = useQuery({
    queryKey: ['campaigns', page],
    queryFn: () => apiGet('/campaigns', { page, limit: 20 }),
  })

  const summaryQuery = useQuery({
    queryKey: ['campaigns', 'summary'],
    queryFn: () => apiGet('/campaigns/summary'),
  })

  const data = campaignsQuery.data
  const items = data?.items || []
  const summary = summaryQuery.data

  return (
    <div className="space-y-8">
      <PageHeader
        title="Campaigns"
        description="Marketing automation templates and legacy campaign execution."
      />

      <CampaignBuilder />

      <h2 className="text-lg font-semibold pt-4">Campaign history</h2>

      {summary && (
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Draft</div><div className="text-2xl font-bold">{summary.draft ?? 0}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Running</div><div className="text-2xl font-bold">{summary.running ?? 0}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Completed</div><div className="text-2xl font-bold">{summary.completed ?? 0}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-muted-foreground">Scheduled</div><div className="text-2xl font-bold">{summary.scheduled ?? 0}</div></CardContent></Card>
        </div>
      )}

      <CampaignTable
        items={items}
        isLoading={campaignsQuery.isLoading}
        page={data?.page || page}
        pages={data?.pages || 1}
        onPageChange={setPage}
      />

      <CampaignCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          campaignsQuery.refetch()
          summaryQuery.refetch()
        }}
      />
    </div>
  )
}
