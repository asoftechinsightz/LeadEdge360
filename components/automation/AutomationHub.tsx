'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import WorkflowBuilder, { type WorkflowDraft } from '@/components/automation/WorkflowBuilder'
import VisualWorkflow from '@/components/automation/VisualWorkflow'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Workflow,
  Play,
  Pause,
  Sparkles,
  Mail,
  MessageCircle,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_DRAFT: WorkflowDraft = {
  name: 'Custom nurture',
  trigger: { type: 'lead_created' },
  steps: [
    { id: 'w1', type: 'wait', delayDays: 1, label: 'Wait 1 day' },
    { id: 'e1', type: 'send_email', label: 'Send email', templateKey: 'custom_email' },
    { id: 'c1', type: 'condition_no_reply', waitDays: 3, label: 'If no reply (3 days)' },
    { id: 'wa1', type: 'send_whatsapp', templateId: 'new_lead', label: 'Send WhatsApp' },
  ],
}

export function AutomationHub() {
  const queryClient = useQueryClient()
  const [builderOpen, setBuilderOpen] = useState(false)
  const [draft, setDraft] = useState<WorkflowDraft>(DEFAULT_DRAFT)
  const [confirmDripId, setConfirmDripId] = useState<string | null>(null)

  const dripsQuery = useQuery({
    queryKey: ['automation', 'drips'],
    queryFn: () => apiGet('/automation/drips'),
  })

  const workflowsQuery = useQuery({
    queryKey: ['automation', 'workflows'],
    queryFn: () => apiGet('/automation/workflows'),
  })

  const activateDripMutation = useMutation({
    mutationFn: (dripId: string) => apiPost(`/automation/drips/${dripId}/activate`, {}),
    onSuccess: (data, dripId) => {
      setConfirmDripId(null)
      toast.success(data.alreadyActive ? 'Already active' : 'Drip activated!', {
        description: data.enrolled != null
          ? `${data.enrolled} leads enrolled · Email + WhatsApp scheduled`
          : 'New leads will enter this sequence automatically.',
      })
      queryClient.invalidateQueries({ queryKey: ['automation'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
    onError: (e: { message?: string }) => toast.error(e.message || 'Activation failed'),
  })

  const saveWorkflowMutation = useMutation({
    mutationFn: () => apiPost('/automation/workflows', draft),
    onSuccess: async (data) => {
      await apiPost(`/automation/workflows/${data.workflow.id}/activate`, {})
      toast.success('Workflow saved and activated')
      setBuilderOpen(false)
      queryClient.invalidateQueries({ queryKey: ['automation'] })
    },
    onError: (e: { message?: string }) => toast.error(e.message || 'Save failed'),
  })

  const drips = dripsQuery.data?.items || []
  const workflows = workflowsQuery.data?.items || []

  if (dripsQuery.isLoading && workflowsQuery.isLoading) {
    return (
      <div className="container py-10">
        <PageHeader title="Automation Hub" description="Workflows, triggers, and multi-channel nurture." />
        <LoadingState label="Loading automations…" rows={5} />
      </div>
    )
  }

  return (
    <div className="container py-10 space-y-8">
      <PageHeader
        title="Automation Hub"
        description="Visual workflows + drip sequences — Email and WhatsApp nurture in 2 clicks."
        actions={
          <Button onClick={() => setBuilderOpen(true)}>
            <Workflow className="size-4 mr-2" /> New workflow
          </Button>
        }
      />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Workflow className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Visual workflow builder</h2>
          <Badge variant="outline" className="text-xs">Drag to reorder</Badge>
        </div>
        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-5 space-y-4">
            <VisualWorkflow value={draft} onChange={setDraft} />
            <Button variant="outline" size="sm" onClick={() => setBuilderOpen(true)}>
              Edit steps in builder
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Pre-built drip sequences</h2>
          <Badge variant="outline" className="text-xs">2-click activate</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {drips.map((drip: {
            id: string
            name: string
            description: string
            trigger: { label?: string }
            channels: string[]
            stepCount: number
          }) => {
            const active = workflows.some((w: { dripTemplateId?: string; status?: string }) =>
              w.dripTemplateId === drip.id && w.status === 'active')
            return (
              <Card key={drip.id} className="bg-card/60 border-border/60 border-primary/10">
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="font-semibold">{drip.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{drip.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{drip.trigger?.label || 'Trigger'}</Badge>
                    <span>{drip.stepCount} steps</span>
                    {drip.channels?.includes('email') && <Mail className="size-3.5" />}
                    {drip.channels?.includes('whatsapp') && <MessageCircle className="size-3.5 text-[#25D366]" />}
                  </div>
                  {confirmDripId === drip.id ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Confirm activation — enrolls matching leads now.</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 rounded-full"
                          disabled={activateDripMutation.isPending}
                          onClick={() => activateDripMutation.mutate(drip.id)}
                        >
                          {activateDripMutation.isPending ? 'Activating…' : 'Confirm activate'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setConfirmDripId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full rounded-full"
                      variant={active ? 'outline' : 'default'}
                      disabled={active}
                      onClick={() => setConfirmDripId(drip.id)}
                    >
                      <Zap className="size-3.5 mr-1.5" />
                      {active ? 'Active' : 'Activate'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Active workflows</h2>
        <div className="space-y-4">
          {workflows.length === 0 && (
            <p className="text-sm text-muted-foreground">No custom workflows yet. Activate a drip above or build your own.</p>
          )}
          {workflows.map((flow: {
            id: string
            name: string
            trigger?: { type?: string; label?: string; stage?: string }
            status: string
            runs?: number
            conversions?: number
            dripTemplateId?: string
          }) => (
            <Card key={flow.id} className="bg-card/60 border-border/60">
              <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 shrink-0">
                    <Workflow className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{flow.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Trigger: {flow.trigger?.label || flow.trigger?.type?.replace(/_/g, ' ')}
                      {flow.trigger?.stage ? ` → ${flow.trigger.stage}` : ''}
                    </p>
                    {flow.dripTemplateId && (
                      <p className="text-xs text-muted-foreground mt-1">Drip: {flow.dripTemplateId}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right text-sm">
                    <div><strong>{flow.runs ?? 0}</strong> runs</div>
                    <div className="text-muted-foreground">{flow.conversions ?? 0} completed</div>
                  </div>
                  <Badge variant={flow.status === 'active' ? 'default' : 'outline'} className="capitalize">
                    {flow.status}
                  </Badge>
                  <div className="flex gap-2">
                    {flow.status === 'active' ? (
                      <Button size="sm" variant="outline" onClick={() => toast.info('Pause coming soon')}>
                        <Pause className="size-3" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => apiPost(`/automation/workflows/${flow.id}/activate`, {}).then(() => {
                          toast.success('Workflow activated')
                          queryClient.invalidateQueries({ queryKey: ['automation'] })
                        })}
                      >
                        <Play className="size-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Workflow builder</DialogTitle>
          </DialogHeader>
          <WorkflowBuilder
            value={draft}
            onChange={setDraft}
            onSave={() => saveWorkflowMutation.mutate()}
            saving={saveWorkflowMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AutomationHub
