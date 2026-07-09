'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { KPICard } from '@/components/design-system/core/KPICard'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { Input } from '@/components/design-system/core/Input'
import { Label } from '@/components/ui/label'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { Clock, UserCheck, AlertTriangle, LifeBuoy, Send } from 'lucide-react'
import { toast } from 'sonner'

const PRIORITY_STYLES: Record<string, string> = {
  urgent: 'bg-red-500/15 text-red-400 border-red-500/30',
  high: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  normal: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

type SupportProfile = {
  planCode?: string
  sla?: {
    label?: string
    responseTime?: string
    ticketPriority?: string
    dedicatedCsm?: boolean
    csmName?: string | null
    csmEmail?: string | null
    description?: string
  }
  openTickets?: number
  recentTickets?: Array<{
    id: string
    subject: string
    status: string
    priority: string
    createdAt: string
    responseDueAt?: string
  }>
  zendeskEnabled?: boolean
}

export function SLADashboard() {
  const queryClient = useQueryClient()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const profileQuery = useQuery({
    queryKey: ['support', 'sla'],
    queryFn: () => apiGet('/support/sla'),
  })

  const ticketMutation = useMutation({
    mutationFn: (payload: { subject: string; body: string }) => apiPost('/support/tickets', payload),
    onSuccess: (data) => {
      if (data?.locked) {
        toast.error('Upgrade for priority support', {
          action: data.upgradeUrl
            ? { label: 'Upgrade', onClick: () => { window.location.href = data.upgradeUrl } }
            : undefined,
        })
        return
      }
      toast.success('Support ticket created', {
        description: data.ticket?.zendeskId
          ? `Zendesk #${data.ticket.zendeskId} · ${data.routing?.priority} priority`
          : `Queued as ${data.ticket?.priority || 'normal'} priority`,
      })
      setSubject('')
      setBody('')
      queryClient.invalidateQueries({ queryKey: ['support', 'sla'] })
    },
    onError: (err: Error) => toast.error(err.message || 'Could not create ticket'),
  })

  if (profileQuery.isLoading) {
    return <LoadingState label="Loading support profile…" rows={4} />
  }

  const profile = (profileQuery.data?.data || profileQuery.data) as SupportProfile
  const sla = profile?.sla || {}

  return (
    <div className="space-y-8">
      <PageHeader
        title="Support & SLA"
        description="Your plan entitlements, response commitments, and open tickets."
        actions={
          <Badge variant="outline" className="gap-1">
            <LifeBuoy className="size-3.5" />
            {sla.label || 'Standard Support'}
          </Badge>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <KPICard
          label="Response time"
          value={sla.responseTime || '24 hours'}
          icon={<Clock className="size-5" />}
          change={sla.description}
        />
        <KPICard
          label="Dedicated CSM"
          value={sla.dedicatedCsm ? (sla.csmName || 'Assigned') : 'Shared pool'}
          icon={<UserCheck className="size-5" />}
          change={sla.dedicatedCsm && sla.csmEmail ? sla.csmEmail : 'Upgrade to Enterprise for a named CSM'}
        />
        <KPICard
          label="Ticket priority"
          value={sla.ticketPriority ? sla.ticketPriority.charAt(0).toUpperCase() + sla.ticketPriority.slice(1) : 'Normal'}
          icon={<AlertTriangle className="size-5" />}
          change={profile.planCode ? `Plan: ${profile.planCode.replace(/_/g, ' ')}` : undefined}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-card/60">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Open a ticket</h3>
            <p className="text-sm text-muted-foreground">
              Enterprise tickets route to urgent priority with your dedicated CSM queue.
              {profile.zendeskEnabled ? ' Synced to Zendesk.' : ' Stored in-app (configure Zendesk for external sync).'}
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Subject</Label>
                <Input
                  className="mt-1"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                />
              </div>
              <div>
                <Label className="text-xs">Details</Label>
                <textarea
                  className="mt-1 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Steps to reproduce, impact, urgency…"
                />
              </div>
              <Button
                className="rounded-full"
                disabled={!subject.trim() || !body.trim() || ticketMutation.isPending}
                onClick={() => ticketMutation.mutate({ subject: subject.trim(), body: body.trim() })}
              >
                <Send className="size-4 mr-2" />
                {ticketMutation.isPending ? 'Submitting…' : 'Submit ticket'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent tickets</h3>
              <Badge variant="outline">{profile.openTickets ?? 0} open</Badge>
            </div>
            {(profile.recentTickets || []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No tickets yet — we&apos;re here when you need us.</p>
            ) : (
              <ul className="space-y-3">
                {(profile.recentTickets || []).map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-3 border-b border-border/40 pb-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.createdAt).toLocaleString()}
                        {t.responseDueAt && ` · Due ${new Date(t.responseDueAt).toLocaleString()}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline" className={`capitalize border ${PRIORITY_STYLES[t.priority] || ''}`}>
                        {t.priority}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground uppercase">{t.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
