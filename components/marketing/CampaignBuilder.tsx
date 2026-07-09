'use client'

import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/src/lib/api'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { Mail, MessageCircle, CheckSquare, Zap, ArrowRight, Workflow } from 'lucide-react'
import { toast } from 'sonner'

const CHANNEL_ICONS = {
  email: Mail,
  whatsapp: MessageCircle,
  task: CheckSquare,
}

/** Marketing Automation v1 — primary entry for nurture templates (replaces legacy Campaigns focus). */
export function CampaignBuilder() {
  const queryClient = useQueryClient()

  const dripsQuery = useQuery({
    queryKey: ['automation', 'drips'],
    queryFn: () => apiGet('/automation/drips'),
  })

  const workflowsQuery = useQuery({
    queryKey: ['automation', 'workflows'],
    queryFn: () => apiGet('/automation/workflows'),
  })

  const activateMutation = useMutation({
    mutationFn: (dripId: string) => apiPost(`/automation/drips/${dripId}/activate`, {}),
    onSuccess: (data) => {
      toast.success(data.alreadyActive ? 'Already active' : 'Automation activated in 2 clicks!')
      queryClient.invalidateQueries({ queryKey: ['automation'] })
    },
    onError: (e: { message?: string }) => toast.error(e.message || 'Activation failed'),
  })

  const drips = dripsQuery.data?.items || []
  const workflows = workflowsQuery.data?.items || []

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Workflow className="size-5 text-primary" />
            Marketing Automation
          </h2>
          <p className="text-sm text-muted-foreground">
            Pre-built nurture sequences — Email, WhatsApp, and call tasks. Primary over legacy campaigns.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href="/leadedge360/automation">
            Open Automation Hub
            <ArrowRight className="size-4 ml-1.5" />
          </Link>
        </Button>
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
            <Card key={drip.id} className="bg-card/60 border-border/60 hover:border-primary/30 transition-colors">
              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="font-semibold">{drip.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{drip.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline">{drip.trigger?.label || 'Trigger'}</Badge>
                  <span className="text-muted-foreground">{drip.stepCount} steps</span>
                  {drip.channels?.map((ch) => {
                    const Icon = CHANNEL_ICONS[ch as keyof typeof CHANNEL_ICONS] || Zap
                    return <Icon key={ch} className="size-3.5" />
                  })}
                </div>
                <Button
                  size="sm"
                  className="w-full rounded-full"
                  variant={active ? 'outline' : 'default'}
                  disabled={active || activateMutation.isPending}
                  onClick={() => activateMutation.mutate(drip.id)}
                >
                  <Zap className="size-3.5 mr-1.5" />
                  {active ? 'Active' : 'Activate in 2 clicks'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

export default CampaignBuilder
