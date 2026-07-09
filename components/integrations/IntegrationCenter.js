'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/src/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/design-system/core/Tabs'

const STATUS_VARIANT = {
  connected: 'default',
  disconnected: 'outline',
  error: 'destructive',
  syncing: 'secondary',
  pending_oauth: 'secondary',
}

const HEALTH_COLOR = {
  healthy: 'text-emerald-600',
  degraded: 'text-amber-600',
  down: 'text-red-600',
  unknown: 'text-muted-foreground',
}

const API_KEY_FIELDS = {
  whatsapp: [
    { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
    { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
    { key: 'appSecret', label: 'App Secret (webhook)', type: 'password' },
    { key: 'verifyToken', label: 'Webhook Verify Token', type: 'text' },
  ],
  razorpay: [
    { key: 'keyId', label: 'Key ID', type: 'text', required: true },
    { key: 'keySecret', label: 'Key Secret', type: 'password', required: true },
    { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
  ],
}

function HealthSummary({ summary }) {
  if (!summary) return null
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Connected', value: summary.connected },
        { label: 'Disconnected', value: summary.disconnected },
        { label: 'Degraded', value: summary.degraded },
        { label: 'Implemented', value: summary.implemented },
      ].map((s) => (
        <div key={s.label} className="rounded-lg border border-border/60 p-3 text-center">
          <p className="text-2xl font-semibold">{s.value}</p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

function ConnectDialog({ integration, open, onOpenChange, onConnect, loading }) {
  const [form, setForm] = useState({})
  const fields = API_KEY_FIELDS[integration?.id] || []
  const isOAuth = integration?.authType === 'oauth2'

  const handleSubmit = () => {
    if (isOAuth) {
      onConnect({ mode: 'oauth' })
    } else {
      onConnect({ credentials: form })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect {integration?.name}</DialogTitle>
        </DialogHeader>
        {isOAuth ? (
          <p className="text-sm text-muted-foreground">
            You will be redirected to authorize access. Credentials are encrypted per tenant.
          </p>
        ) : (
          <div className="space-y-3 py-2">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input
                  id={f.key}
                  type={f.type}
                  value={form[f.key] || ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  required={f.required}
                />
              </div>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Connecting…' : isOAuth ? 'Authorize' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function IntegrationCard({ item, isAdmin, onAction, actionLoading }) {
  const apiHealth = item.health?.apiStatus || 'unknown'
  const webhookHealth = item.health?.webhookStatus || 'unknown'

  return (
    <Card className="bg-card/60 h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{item.name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{item.description || item.category}</p>
          </div>
          <Badge variant={STATUS_VARIANT[item.status] || 'outline'} className="shrink-0">
            {item.status === 'pending_oauth' ? 'Pending' : item.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-muted-foreground">API</span>
            <p className={`font-medium capitalize ${HEALTH_COLOR[apiHealth]}`}>{apiHealth}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Webhook</span>
            <p className={`font-medium capitalize ${HEALTH_COLOR[webhookHealth]}`}>{webhookHealth}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Last sync</span>
            <p className="font-medium">{item.lastSyncAt ? new Date(item.lastSyncAt).toLocaleString() : '—'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Phase</span>
            <p className="font-medium">{item.phase}</p>
          </div>
        </div>
        {!item.implemented && (
          <p className="text-muted-foreground italic">Coming in phase {item.phase}</p>
        )}
        {item.health?.lastError && (
          <p className="text-red-600 truncate" title={item.health.lastError}>{item.health.lastError}</p>
        )}
        {isAdmin && item.implemented && (
          <div className="flex flex-wrap gap-2 mt-auto pt-2">
            {item.status === 'disconnected' || item.status === 'error' ? (
              <Button size="sm" onClick={() => onAction('connect', item)} disabled={actionLoading}>
                Connect
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => onAction('test', item)} disabled={actionLoading}>
                  Test
                </Button>
                <Button size="sm" variant="outline" onClick={() => onAction('sync', item)} disabled={actionLoading || item.status === 'syncing'}>
                  Sync
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onAction('disconnect', item)} disabled={actionLoading}>
                  Disconnect
                </Button>
              </>
            )}
          </div>
        )}
        {!isAdmin && item.implemented && (
          <p className="text-muted-foreground text-[11px]">Contact your organization admin to configure.</p>
        )}
      </CardContent>
    </Card>
  )
}

export function IntegrationCenter({ isAdmin = false }) {
  const queryClient = useQueryClient()
  const [connectTarget, setConnectTarget] = useState(null)
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [message, setMessage] = useState(null)

  const healthQuery = useQuery({
    queryKey: ['integrations', 'health'],
    queryFn: () => apiGet('/integrations/health'),
  })

  const auditQuery = useQuery({
    queryKey: ['integrations', 'audit'],
    queryFn: () => apiGet('/integrations/audit?limit=30'),
  })

  const integrations = healthQuery.data?.integrations || []
  const summary = healthQuery.data?.summary

  const filtered = useMemo(() => {
    if (phaseFilter === 'all') return integrations
    return integrations.filter((i) => String(i.phase) === phaseFilter)
  }, [integrations, phaseFilter])

  const mutation = useMutation({
    mutationFn: async ({ action, id, body }) => {
      const path = `/integrations/${id}/${action}`
      if (action === 'disconnect') return apiPost(path, {})
      return apiPost(path, body || {})
    },
    onSuccess: (data, vars) => {
      if (vars.action === 'connect' && data?.oauthUrl) {
        window.location.href = data.oauthUrl
        return
      }
      setMessage(data?.result?.message || data?.message || 'Done')
      setConnectTarget(null)
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
    onError: (e) => setMessage(e.message || 'Action failed'),
  })

  const handleAction = (action, item) => {
    setMessage(null)
    if (action === 'connect') {
      setConnectTarget(item)
      return
    }
    if (action === 'disconnect' && !window.confirm(`Disconnect ${item.name}?`)) return
    mutation.mutate({ action, id: item.id })
  }

  const handleConnect = (body) => {
    mutation.mutate({ action: 'connect', id: connectTarget.id, body })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Integration Center</h2>
        <p className="text-sm text-muted-foreground">
          Connect third-party services with encrypted per-tenant credentials, health monitoring, and audit logs.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-border/60 bg-muted/40 px-4 py-2 text-sm">{message}</div>
      )}

      <HealthSummary summary={summary} />

      <Tabs value={phaseFilter} onValueChange={setPhaseFilter}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All</TabsTrigger>
          {[1, 2, 3, 4, 5].map((p) => (
            <TabsTrigger key={p} value={String(p)}>Phase {p}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={phaseFilter} className="mt-4">
          {healthQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading integrations…</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <IntegrationCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onAction={handleAction}
                  actionLoading={mutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Card className="bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Recent audit log</CardTitle>
        </CardHeader>
        <CardContent>
          {auditQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto text-xs">
              {(auditQuery.data?.logs || []).map((log) => (
                <li key={log.id} className="flex justify-between gap-2 border-b border-border/40 pb-1">
                  <span>
                    <span className="font-medium">{log.integrationId}</span>
                    {' · '}
                    {log.action}
                    {log.detail ? ` — ${log.detail}` : ''}
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
              {!auditQuery.data?.logs?.length && (
                <li className="text-muted-foreground">No integration activity yet.</li>
              )}
            </ul>
          )}
        </CardContent>
      </Card>

      <ConnectDialog
        integration={connectTarget}
        open={!!connectTarget}
        onOpenChange={(o) => !o && setConnectTarget(null)}
        onConnect={handleConnect}
        loading={mutation.isPending}
      />
    </div>
  )
}
