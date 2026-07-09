'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPut, apiPost } from '@/src/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/design-system/core/LoadingState'

export function AIWorkforceSettings() {
  const qc = useQueryClient()
  const [saving, setSaving] = useState(false)

  const settingsQuery = useQuery({
    queryKey: ['agents', 'settings'],
    queryFn: () => apiGet('/agents/settings'),
  })

  const profilesQuery = useQuery({
    queryKey: ['agents', 'industry-profiles'],
    queryFn: () => apiGet('/agents/industry-profiles'),
  })

  const agentsQuery = useQuery({
    queryKey: ['agents', 'registry'],
    queryFn: () => apiGet('/agents'),
  })

  const usageQuery = useQuery({
    queryKey: ['agents', 'usage'],
    queryFn: () => apiGet('/agents/usage', { sinceHours: 720 }),
  })

  if (settingsQuery.isLoading) return <LoadingState label="Loading AI workforce settings…" rows={6} />

  const settings = settingsQuery.data?.settings || {}
  const agents = agentsQuery.data?.agents || []
  const profiles = profilesQuery.data?.profiles || []
  const currentProfile = settingsQuery.data?.industry?.profileName || 'Not set'
  const budget = usageQuery.data?.budget || {}

  const updateSettings = async (patch) => {
    setSaving(true)
    try {
      await apiPut('/agents/settings', { ...settings, ...patch })
      qc.invalidateQueries({ queryKey: ['agents'] })
    } finally {
      setSaving(false)
    }
  }

  const toggleAgent = async (agentId, field, value) => {
    const agentsConfig = { ...(settings.agents || {}) }
    agentsConfig[agentId] = { ...agentsConfig[agentId], [field]: value }
    await updateSettings({ agents: agentsConfig })
  }

  const applyProfile = async (profileId) => {
    setSaving(true)
    try {
      await apiPost('/agents/industry-profiles', { profileId })
      qc.invalidateQueries({ queryKey: ['agents'] })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card/60">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-1">AI Workforce</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Configure which AI employees run, approval policies, and usage limits for your organization.
          </p>

          <label className="flex items-center justify-between text-sm mb-4">
            <span>Enable AI workforce</span>
            <input
              type="checkbox"
              checked={settings.enabled !== false}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <label className="text-sm">
              <span className="text-muted-foreground block mb-1">AI Model</span>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={settings.model || 'gpt-4o-mini'}
                onChange={(e) => updateSettings({ model: e.target.value })}
              >
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4o">GPT-4o</option>
              </select>
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground block mb-1">Confidence threshold</span>
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={settings.confidenceThreshold ?? 0.6}
                onChange={(e) => updateSettings({ confidenceThreshold: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground block mb-1">Daily execution limit</span>
              <input
                type="number"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={settings.dailyExecutionLimit ?? 500}
                onChange={(e) => updateSettings({ dailyExecutionLimit: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm">
              <span className="text-muted-foreground block mb-1">Monthly token budget</span>
              <input
                type="number"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={settings.monthlyTokenBudget ?? 1000000}
                onChange={(e) => updateSettings({ monthlyTokenBudget: Number(e.target.value) })}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm mb-2">
            <input
              type="checkbox"
              checked={settings.businessHours?.enabled || false}
              onChange={(e) => updateSettings({
                businessHours: { ...settings.businessHours, enabled: e.target.checked },
              })}
            />
            Restrict AI to business hours ({settings.businessHours?.start || '09:00'}–{settings.businessHours?.end || '18:00'})
          </label>

          <p className="text-xs text-muted-foreground mt-4">
            Budget utilization: {budget.utilization?.tokens ?? 0}% tokens · {budget.utilization?.cost ?? 0}% cost
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-1">Industry profile</h2>
          <p className="text-sm text-muted-foreground mb-4">Current: <Badge variant="outline">{currentProfile}</Badge></p>
          <div className="grid sm:grid-cols-3 gap-2">
            {profiles.map((p) => (
              <Button
                key={p.id}
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => applyProfile(p.id)}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">AI Employees</h2>
          <div className="space-y-3">
            {agents.map((agent) => {
              const cfg = settings.agents?.[agent.id] || {}
              const enabled = cfg.enabled !== false
              return (
                <div key={agent.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.role} · {agent.description?.slice(0, 60)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => toggleAgent(agent.id, 'enabled', e.target.checked)}
                      />
                      Enabled
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={cfg.autoRun ?? agent.autoRun}
                        onChange={(e) => toggleAgent(agent.id, 'autoRun', e.target.checked)}
                      />
                      Auto-run
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={cfg.requiresApproval ?? agent.requiresApproval}
                        onChange={(e) => toggleAgent(agent.id, 'requiresApproval', e.target.checked)}
                      />
                      Approval
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
