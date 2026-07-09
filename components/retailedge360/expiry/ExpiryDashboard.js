'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPut } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { KPICard } from '@/components/design-system/core/KPICard'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { SectionHeader } from '@/components/design-system/core/PageHeader'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { formatCurrency, CHART_COLORS } from '../constants'
import { toast } from 'sonner'
import {
  AlertTriangle, Package, RotateCcw, Trash2, ScanLine, FileBarChart,
  Bot, Clock, IndianRupee, ShieldAlert, RefreshCw, Download,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Clock },
  { id: 'batches', label: 'Batches', icon: Package },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'returns', label: 'Returns', icon: RotateCcw },
  { id: 'disposals', label: 'Disposals', icon: Trash2 },
  { id: 'scanner', label: 'Scanner', icon: ScanLine },
  { id: 'ai', label: 'AI Insights', icon: Bot },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
]

const tooltipStyle = {
  background: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
}

function ExpiryColorBadge({ days }) {
  if (days === null || days === undefined) return <Badge variant="outline">N/A</Badge>
  if (days < 0) return <Badge className="bg-red-500/15 text-red-700 border-red-500/30">Expired</Badge>
  if (days <= 7) return <Badge className="bg-orange-500/15 text-orange-700 border-orange-500/30">{days}d left</Badge>
  if (days <= 30) return <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30">{days}d left</Badge>
  return <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">{days}d left</Badge>
}

function DashboardTab({ data }) {
  const kpis = data?.kpis || {}
  const charts = data?.charts || {}
  const widgets = data?.widgets || {}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <KPICard label="Expired" value={kpis.totalExpired ?? 0} icon={<AlertTriangle className="h-4 w-4" />} trend="down" />
        <KPICard label="Expiring Today" value={kpis.expiringToday ?? 0} icon={<Clock className="h-4 w-4" />} />
        <KPICard label="7 Days" value={kpis.expiring7Days ?? 0} icon={<ShieldAlert className="h-4 w-4" />} />
        <KPICard label="30 Days" value={kpis.expiring30Days ?? 0} icon={<Package className="h-4 w-4" />} />
        <KPICard label="Est. Loss" value={formatCurrency(kpis.estimatedExpiryLoss)} icon={<IndianRupee className="h-4 w-4" />} />
        <KPICard label="60 Days" value={kpis.expiring60Days ?? 0} />
        <KPICard label="90 Days" value={kpis.expiring90Days ?? 0} />
        <KPICard label="Returns Pending" value={kpis.returnPending ?? 0} icon={<RotateCcw className="h-4 w-4" />} />
        <KPICard label="Destroyed Value" value={formatCurrency(kpis.destroyedInventoryValue)} icon={<Trash2 className="h-4 w-4" />} />
        <KPICard label="Active Batches" value={kpis.activeBatches ?? 0} icon={<Package className="h-4 w-4" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-5">
            <SectionHeader title="Monthly Expiry Trend" />
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={charts.monthlyExpiryTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="hsl(var(--brand-electric))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-5">
            <SectionHeader title="Category-wise Expiry" />
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={charts.categoryWiseExpiry || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {(charts.categoryWiseExpiry || []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-5">
            <SectionHeader title="Financial Loss Trend" />
            <div className="h-56">
              <ResponsiveContainer>
                <LineChart data={charts.financialLossTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(v)} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--destructive))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-5">
            <SectionHeader title="Batch Distribution" />
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart data={charts.batchDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="hsl(var(--brand-orange))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="bg-card/60 border-border/60 lg:col-span-2">
          <CardContent className="p-5">
            <SectionHeader title="Top 10 Expiring Products" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground text-left">
                    <th className="py-2 pr-2">Product</th>
                    <th className="py-2 pr-2">Batch</th>
                    <th className="py-2 pr-2">Days</th>
                    <th className="py-2 pr-2">Qty</th>
                    <th className="py-2">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {(widgets.topExpiring || []).map((item, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="py-2 pr-2 font-medium">{item.productName}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{item.batchNumber}</td>
                      <td className="py-2 pr-2"><ExpiryColorBadge days={item.daysRemaining} /></td>
                      <td className="py-2 pr-2">{item.quantity}</td>
                      <td className="py-2">{formatCurrency(item.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!(widgets.topExpiring?.length) && <EmptyState title="No expiring products" />}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-5">
            <SectionHeader title="Critical Alerts" />
            <div className="space-y-2">
              {(data?.criticalAlerts || []).map((a) => (
                <div key={a.id} className="p-3 rounded-lg border border-border/60 bg-background/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">{a.productName}</span>
                    <Badge variant={a.level === 'critical' ? 'destructive' : 'outline'}>{a.level}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.message}</p>
                </div>
              ))}
              {!(data?.criticalAlerts?.length) && <EmptyState title="No critical alerts" />}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BatchesTab() {
  const queryClient = useQueryClient()
  const batchesQuery = useQuery({
    queryKey: ['expiry', 'batches'],
    queryFn: () => apiGet('/retail/expiry/batches?limit=50'),
  })
  const items = batchesQuery.data?.items || []

  const handleExport = () => {
    window.open('/api/retail/expiry/batches/export?format=csv', '_blank')
  }

  if (batchesQuery.isLoading) return <LoadingState label="Loading batches…" />

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 text-left text-muted-foreground">
              <th className="p-3">Batch</th>
              <th className="p-3">Product</th>
              <th className="p-3">Supplier</th>
              <th className="p-3">Warehouse</th>
              <th className="p-3">Expiry</th>
              <th className="p-3">Days</th>
              <th className="p-3">Available</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="border-t border-border/40 hover:bg-muted/20">
                <td className="p-3 font-mono text-xs">{b.batchNumber}</td>
                <td className="p-3">{b.productName}</td>
                <td className="p-3 text-muted-foreground">{b.supplier}</td>
                <td className="p-3">{b.warehouseName}</td>
                <td className="p-3">{b.expiryDate?.slice(0, 10)}</td>
                <td className="p-3"><ExpiryColorBadge days={b.daysRemaining} /></td>
                <td className="p-3">{b.quantityAvailable}</td>
                <td className="p-3"><Badge variant="outline">{b.batchStatus}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <EmptyState title="No batches" description="Batches are created automatically on purchase." />}
      </div>
    </div>
  )
}

function AlertsTab({ onRunAlerts }) {
  const alertsQuery = useQuery({
    queryKey: ['expiry', 'alerts'],
    queryFn: () => apiGet('/retail/expiry/alerts?limit=50'),
  })
  const items = alertsQuery.data?.items || []

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={onRunAlerts}>
          <RefreshCw className="h-4 w-4 mr-1" /> Run Alert Engine
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((a) => (
          <Card key={a.id} className="bg-card/60 border-border/60">
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-medium">{a.productName}</p>
                  <p className="text-xs text-muted-foreground">{a.batchNumber}</p>
                </div>
                <Badge variant={a.level === 'critical' ? 'destructive' : 'outline'}>{a.level}</Badge>
              </div>
              <p className="text-sm mt-2">{a.message}</p>
              <p className="text-xs text-muted-foreground mt-1">Qty: {a.quantityAvailable}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {!items.length && <EmptyState title="No alerts" description="Run the alert engine to scan batches." />}
    </div>
  )
}

function ReturnsTab() {
  const returnsQuery = useQuery({
    queryKey: ['expiry', 'returns'],
    queryFn: () => apiGet('/retail/expiry/returns'),
  })
  const items = returnsQuery.data?.items || []

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 text-left text-muted-foreground">
            <th className="p-3">Return #</th>
            <th className="p-3">Product</th>
            <th className="p-3">Supplier</th>
            <th className="p-3">Qty</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t border-border/40">
              <td className="p-3 font-mono text-xs">{r.returnNumber}</td>
              <td className="p-3">{r.productName}</td>
              <td className="p-3">{r.supplier}</td>
              <td className="p-3">{r.quantity}</td>
              <td className="p-3"><Badge variant="outline">{r.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!items.length && <EmptyState title="No returns" />}
    </div>
  )
}

function DisposalsTab() {
  const disposalsQuery = useQuery({
    queryKey: ['expiry', 'disposals'],
    queryFn: () => apiGet('/retail/expiry/disposals'),
  })
  const items = disposalsQuery.data?.items || []

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/30 text-left text-muted-foreground">
            <th className="p-3">Disposal #</th>
            <th className="p-3">Product</th>
            <th className="p-3">Reason</th>
            <th className="p-3">Qty</th>
            <th className="p-3">Loss</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id} className="border-t border-border/40">
              <td className="p-3 font-mono text-xs">{d.disposalNumber}</td>
              <td className="p-3">{d.productName}</td>
              <td className="p-3">{d.reason}</td>
              <td className="p-3">{d.quantity}</td>
              <td className="p-3">{formatCurrency(d.financialLoss)}</td>
              <td className="p-3"><Badge variant="outline">{d.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!items.length && <EmptyState title="No disposals" />}
    </div>
  )
}

function ScannerTab() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)

  const scanMutation = useMutation({
    mutationFn: (c) => apiGet(`/retail/expiry/scanner?code=${encodeURIComponent(c)}`),
    onSuccess: (data) => setResult(data.batch),
    onError: (err) => toast.error(err.message || 'Scan failed'),
  })

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Card className="bg-card/60 border-border/60">
        <CardContent className="p-6 space-y-4">
          <SectionHeader title="Barcode Scanner" description="Scan or enter barcode / batch number" />
          <input
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-lg font-mono"
            placeholder="Scan barcode…"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && code && scanMutation.mutate(code)}
          />
          <Button className="w-full" onClick={() => code && scanMutation.mutate(code)} disabled={scanMutation.isPending}>
            <ScanLine className="h-4 w-4 mr-2" /> Lookup
          </Button>
        </CardContent>
      </Card>
      {result && (
        <Card className={`border-2 ${result.expiryColor === 'red' ? 'border-red-500' : result.expiryColor === 'orange' ? 'border-orange-500' : result.expiryColor === 'yellow' ? 'border-amber-500' : 'border-emerald-500'}`}>
          <CardContent className="p-6 space-y-3">
            <h3 className="text-lg font-semibold">{result.productName}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Batch:</span> {result.batchNumber}</div>
              <div><span className="text-muted-foreground">Status:</span> {result.batchStatus}</div>
              <div><span className="text-muted-foreground">Expiry:</span> {result.expiryDate?.slice(0, 10)}</div>
              <div><span className="text-muted-foreground">Mfg:</span> {result.manufacturingDate?.slice(0, 10) || '—'}</div>
              <div><span className="text-muted-foreground">Days Left:</span> <ExpiryColorBadge days={result.daysRemaining} /></div>
              <div><span className="text-muted-foreground">Available:</span> {result.quantityAvailable}</div>
              <div><span className="text-muted-foreground">Warehouse:</span> {result.warehouseName}</div>
              <div><span className="text-muted-foreground">Shelf:</span> {result.shelf || '—'}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AiTab({ onRunForecast }) {
  const forecastsQuery = useQuery({
    queryKey: ['expiry', 'forecasts'],
    queryFn: () => apiGet('/retail/expiry/forecasts'),
  })
  const items = forecastsQuery.data?.items || []

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={onRunForecast}>
          <Bot className="h-4 w-4 mr-1" /> Generate AI Recommendations
        </Button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((f) => (
          <Card key={f.id} className="bg-card/60 border-border/60">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <p className="font-medium">{f.productName}</p>
                <Badge>{Math.round(f.confidenceScore * 100)}% conf.</Badge>
              </div>
              <Badge variant="outline" className="mt-2">{f.recommendationType}</Badge>
              <p className="text-sm mt-2">{f.recommendation}</p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>Loss: {formatCurrency(f.predictedLoss)}</span>
                <span>Waste: {f.predictedWaste} units</span>
                <span>{f.daysToExpiry}d to expiry</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!items.length && <EmptyState title="No AI recommendations" description="Run the forecast engine to generate insights." />}
    </div>
  )
}

function ReportsTab() {
  const REPORT_TYPES = [
    'expired', 'near_expiry', 'batch', 'warehouse', 'supplier',
    'category', 'financial_loss', 'return', 'disposal', 'forecast',
  ]

  const handleExport = (type) => {
    window.open(`/api/retail/expiry/reports?type=${type}&format=csv`, '_blank')
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {REPORT_TYPES.map((type) => (
        <Card key={type} className="bg-card/60 border-border/60">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="font-medium capitalize">{type.replace(/_/g, ' ')} Report</span>
            <Button variant="outline" size="sm" onClick={() => handleExport(type)}>
              <Download className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ExpiryManagementInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get('tab') || 'dashboard'
  const queryClient = useQueryClient()

  const dashboardQuery = useQuery({
    queryKey: ['expiry', 'dashboard'],
    queryFn: () => apiGet('/retail/expiry/dashboard'),
    enabled: tab === 'dashboard',
  })

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['expiry'] })
  }, [queryClient])

  const runAlerts = useMutation({
    mutationFn: () => apiPost('/retail/expiry/alerts/run'),
    onSuccess: (d) => {
      toast.success(`Alerts: ${d.created} created, ${d.updated} updated`)
      refresh()
    },
    onError: (e) => toast.error(e.message),
  })

  const runForecast = useMutation({
    mutationFn: () => apiPost('/retail/expiry/forecasts/run'),
    onSuccess: (d) => {
      toast.success(`${d.count} AI recommendations generated`)
      refresh()
    },
    onError: (e) => toast.error(e.message),
  })

  const setTab = (id) => {
    router.push(`/retailedge360/expiry?tab=${id}`)
  }

  if (tab === 'dashboard' && dashboardQuery.isLoading) {
    return (
      <div className="container py-10">
        <LoadingState label="Loading expiry dashboard…" rows={8} />
      </div>
    )
  }

  return (
    <div className="container py-6 md:py-10 space-y-6">
      <PageHeader
        title="Expiry Management"
        description="Inventory → Expiry Management · Track batches, alerts, FEFO, and AI recommendations"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="accent">Enterprise</Badge>
            <Button variant="outline" size="sm" onClick={refresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-2">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          )
        })}
      </div>

      {tab === 'dashboard' && <DashboardTab data={dashboardQuery.data} />}
      {tab === 'batches' && <BatchesTab />}
      {tab === 'alerts' && <AlertsTab onRunAlerts={() => runAlerts.mutate()} />}
      {tab === 'returns' && <ReturnsTab />}
      {tab === 'disposals' && <DisposalsTab />}
      {tab === 'scanner' && <ScannerTab />}
      {tab === 'ai' && <AiTab onRunForecast={() => runForecast.mutate()} />}
      {tab === 'reports' && <ReportsTab />}
    </div>
  )
}

export function ExpiryManagement() {
  return (
    <Suspense fallback={<LoadingState label="Loading…" />}>
      <ExpiryManagementInner />
    </Suspense>
  )
}
