'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut, apiPatch } from '@/src/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const STATUSES = ['draft', 'scheduled', 'running', 'completed']

export function CampaignDetailPanel({ campaignId }) {
  const qc = useQueryClient()

  const detailQuery = useQuery({
    queryKey: ['campaigns', campaignId],
    queryFn: () => apiGet(`/campaigns/${campaignId}`),
    enabled: !!campaignId,
  })

  const analyticsQuery = useQuery({
    queryKey: ['campaigns', campaignId, 'analytics'],
    queryFn: () => apiGet(`/campaigns/${campaignId}/analytics`),
    enabled: !!campaignId,
  })

  const templatesQuery = useQuery({
    queryKey: ['templates', 'email'],
    queryFn: () => apiGet('/templates/email', { limit: 50 }),
  })

  const campaign = detailQuery.data?.campaign
  const analytics = analyticsQuery.data
  const templates = templatesQuery.data?.items || []

  const patchMutation = useMutation({
    mutationFn: (body) => apiPatch(`/campaigns/${campaignId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns', campaignId] })
      qc.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })

  const templateMutation = useMutation({
    mutationFn: (templateId) => apiPut(`/campaigns/${campaignId}/template`, { templateId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns', campaignId] }),
  })

  const executeMutation = useMutation({
    mutationFn: () => apiPost(`/campaigns/${campaignId}/execute`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns', campaignId, 'analytics'] })
    },
  })

  if (detailQuery.isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading campaign…</div>
  }

  if (!campaign) {
    return <div className="py-12 text-center text-muted-foreground">Campaign not found.</div>
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 border-border/60">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{campaign.name}</h2>
              <p className="text-sm text-muted-foreground capitalize">{campaign.channel} campaign</p>
            </div>
            <Badge variant="outline">{campaign.status}</Badge>
          </div>
          {campaign.scheduledAt && (
            <p className="text-sm text-muted-foreground">
              Scheduled: {new Date(campaign.scheduledAt).toLocaleString()}
            </p>
          )}
          {campaign.templateId && (
            <p className="text-sm">Template: {campaign.templateId}</p>
          )}
        </CardContent>
      </Card>

      {analytics && (
        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-6 grid sm:grid-cols-3 gap-4">
            <div><div className="text-sm text-muted-foreground">Executions</div><div className="text-xl font-bold">{analytics.totalExecutions ?? 0}</div></div>
            <div><div className="text-sm text-muted-foreground">Messages</div><div className="text-xl font-bold">{analytics.totalMessages ?? 0}</div></div>
            <div><div className="text-sm text-muted-foreground">Success rate</div><div className="text-xl font-bold">{analytics.executionSuccessRate ?? 0}%</div></div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="font-medium mb-2">Status</h3>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={(campaign.status || 'draft') === status ? 'default' : 'outline'}
              disabled={patchMutation.isPending}
              onClick={() => patchMutation.mutate({ status })}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Email template</h3>
        <div className="flex flex-wrap gap-2">
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No templates — create one under Templates.</p>
          ) : templates.map((t) => (
            <Button
              key={t.id}
              size="sm"
              variant={campaign.templateId === t.id ? 'default' : 'outline'}
              disabled={templateMutation.isPending}
              onClick={() => templateMutation.mutate(t.id)}
            >
              {t.name || t.id}
            </Button>
          ))}
        </div>
      </div>

      {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
        <Button
          onClick={() => executeMutation.mutate()}
          disabled={executeMutation.isPending || !campaign.templateId}
        >
          {executeMutation.isPending ? 'Starting…' : 'Execute campaign'}
        </Button>
      )}
    </div>
  )
}
