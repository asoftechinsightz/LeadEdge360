'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiDelete, apiGet, apiPost } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { KPICard } from '@/components/design-system/core/KPICard'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { SectionHeader } from '@/components/design-system/core/PageHeader'
import { RetailAnalytics } from './RetailAnalytics'
import { RetailPosCheckout } from './RetailPosCheckout'
import { InventoryTable } from './InventoryTable'
import { ProductCaptureDialog } from './ProductCaptureDialog'
import { ProductDetailDialog } from './ProductDetailDialog'
import { formatCurrency } from './constants'
import { toast } from 'sonner'
import {
  Package, AlertTriangle, ShieldCheck, IndianRupee, Plus, Bot,
} from 'lucide-react'

export function RetailDashboard() {
  const queryClient = useQueryClient()
  const [captureOpen, setCaptureOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const productsQuery = useQuery({
    queryKey: ['retail', 'products'],
    queryFn: () => apiGet('/retail/inventory'),
  })

  const kpisQuery = useQuery({
    queryKey: ['retail', 'kpis'],
    queryFn: () => apiGet('/retail/kpis'),
  })

  const products = productsQuery.data?.products || productsQuery.data?.items || []
  const kpis = kpisQuery.data

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['retail'] })
  }

  const repredictMutation = useMutation({
    mutationFn: (id) => apiPost(`/retail/inventory/${id}/repredict`),
    onSuccess: (data) => {
      toast.success(`Updated: ${data.product?.predictedShelfDays}d (${data.product?.risk} risk)`)
      refresh()
    },
    onError: (err) => toast.error(err.message || 'Re-predict failed'),
  })

  const removeMutation = useMutation({
    mutationFn: (id) => apiDelete(`/retail/inventory/${id}`),
    onSuccess: () => {
      toast.success('SKU removed')
      setSelected(null)
      refresh()
    },
    onError: (err) => toast.error(err.message || 'Remove failed'),
  })

  const handleRepredict = (id) => {
    toast.loading('RevenueShield AI re-predicting…', { id: 'repredict' })
    repredictMutation.mutate(id, {
      onSettled: () => toast.dismiss('repredict'),
    })
  }

  if (productsQuery.isLoading || kpisQuery.isLoading) {
    return (
      <div className="container py-10">
        <PageHeader title="Retail Growth Command Center" description="RetailEdge360 · Smart retail growth platform" />
        <LoadingState label="Loading retail dashboard…" rows={6} />
      </div>
    )
  }

  const highRiskCount = kpis?.byRisk?.find((r) => r.name === 'High')?.value ?? kpis?.highRisk ?? 0

  return (
    <div className="container py-10 space-y-8">
      <PageHeader
        title="Retail Growth Command Center"
        description="Manage inventory, improve customer loyalty, and accelerate retail growth."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="accent">Retail Inventory</Badge>
            <Button className="rounded-full bg-accent hover:bg-accent/90" onClick={() => setCaptureOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add SKU
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          label="Total SKUs"
          value={kpis?.total ?? '—'}
          change={`${highRiskCount} at risk`}
          icon={<Package className="size-5" />}
        />
        <KPICard
          label="Inventory value"
          value={kpis ? formatCurrency(kpis.inventoryValue) : '—'}
          icon={<IndianRupee className="size-5" />}
        />
        <KPICard
          label="At-risk value"
          value={kpis ? formatCurrency(kpis.atRiskValue) : '—'}
          change="expiring < 7 days"
          trend="down"
          icon={<AlertTriangle className="size-5" />}
        />
        <KPICard
          label="Revenue shielded"
          value={kpis ? formatCurrency(kpis.savedSoFar) : '—'}
          icon={<ShieldCheck className="size-5" />}
        />
        <KPICard
          label="AI engine"
          value={products[0]?.engine === 'llm' ? 'LLM' : 'Hybrid'}
          icon={<Bot className="size-5" />}
        />
      </div>

      <RetailAnalytics kpis={kpis} />

      <RetailPosCheckout />

      <Card className="bg-card/60 border-border/60">
        <CardContent className="p-0">
          <div className="px-5 py-4 border-b border-border/40">
            <SectionHeader
              title={`${products.length} SKUs`}
              description="Sorted by shelf-life risk"
            />
          </div>
          <InventoryTable
            products={products}
            onSelect={setSelected}
            onRepredict={handleRepredict}
            onRemove={(id) => removeMutation.mutate(id)}
          />
        </CardContent>
      </Card>

      <ProductCaptureDialog
        open={captureOpen}
        onOpenChange={setCaptureOpen}
        onSuccess={refresh}
      />

      <ProductDetailDialog
        product={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onRepredict={handleRepredict}
      />
    </div>
  )
}
