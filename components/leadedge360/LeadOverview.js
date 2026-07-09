'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { Input } from '@/components/design-system/core/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Megaphone } from 'lucide-react'
import { AIScoreBadge } from '@/components/leads/AIScoreBadge'
import { apiGet, apiPatch } from '@/src/lib/api'
import { STATUSES } from './constants'
import { toast } from 'sonner'

export function LeadOverview({ lead, leadId, onChanged }) {
  const [form, setForm] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    company: lead?.company || '',
    status: lead?.status || 'New',
    territory: lead?.territory || '',
  })

  const territoriesQuery = useQuery({
    queryKey: ['territories'],
    queryFn: () => apiGet('/territories'),
  })

  const territories = territoriesQuery.data?.items || []

  useEffect(() => {
    setForm({
      name: lead?.name || '',
      email: lead?.email || '',
      phone: lead?.phone || '',
      company: lead?.company || '',
      status: lead?.status || 'New',
      territory: lead?.territory || '',
    })
  }, [lead])

  const saveLead = useMutation({
    mutationFn: () => apiPatch(`/leads/${leadId}`, form),
    onSuccess: () => {
      toast.success('Lead updated')
      onChanged?.()
    },
    onError: (err) => toast.error(err.message || 'Failed to update lead'),
  })

  if (!lead) return null

  const attributionLabel = lead.attribution?.displayLabel
    || (lead.attribution?.campaignName && lead.attribution?.platform === 'meta'
      ? `Came from Meta Ad: ${lead.attribution.campaignName}`
      : lead.attribution?.campaignName && lead.attribution?.platform === 'google'
        ? `Came from Google Ad: ${lead.attribution.campaignName}`
        : null)

  return (
    <div className="space-y-4">
      {attributionLabel && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{attributionLabel}</p>
              {lead.attribution?.utm_campaign && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  UTM: {lead.attribution.utm_source}/{lead.attribution.utm_medium}/{lead.attribution.utm_campaign}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="bg-card/60">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-semibold">Edit lead</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Name</Label>
              <Input className="mt-1 h-9" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input className="mt-1 h-9" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input className="mt-1 h-9" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Company</Label>
              <Input className="mt-1 h-9" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Territory</Label>
              <Select value={form.territory} onValueChange={(v) => setForm({ ...form, territory: v })}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select territory" /></SelectTrigger>
                <SelectContent>
                  {territories.map((t) => (
                    <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                  ))}
                  {form.territory && !territories.some((t) => t.name === form.territory) && (
                    <SelectItem value={form.territory}>{form.territory}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="sm" disabled={saveLead.isPending} onClick={() => saveLead.mutate()}>
            Save changes
          </Button>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        <div><span className="text-muted-foreground text-xs block">Source</span>{lead.source}</div>
        <div><span className="text-muted-foreground text-xs block">Territory</span>{form.territory || lead.territory || '—'}</div>
        <div><span className="text-muted-foreground text-xs block">Assigned to</span>{lead.assignedTo || '—'}</div>
        <div><span className="text-muted-foreground text-xs block">Budget</span>₹{Number(lead.budget || 0).toLocaleString()}</div>
        <div><span className="text-muted-foreground text-xs block">Created</span>{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : '—'}</div>
      </div>
      {lead.message && (
        <Card className="bg-card/60">
          <CardContent className="p-4 text-sm">{lead.message}</CardContent>
        </Card>
      )}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold">AI Score</span>
          </div>
          <AIScoreBadge
            closeProbability={lead.closeProbability ?? lead.score}
            score={lead.score}
            label={lead.label}
            reasons={lead.predictiveReasons || lead.reasons}
            engine={lead.scoringEngine}
          />
          {(lead.predictiveReasons || lead.reasons || []).length > 0 && (
            <ul className="text-sm space-y-1 text-muted-foreground mt-3">
              {(lead.predictiveReasons || lead.reasons || []).map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
