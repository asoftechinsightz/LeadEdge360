'use client'

import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { DataCard } from '@/components/design-system/core/DataCard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/design-system/core/Table'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { useIsMobile } from '@/hooks/use-mobile'
import { RefreshCw, Plus } from 'lucide-react'
import { RISK_STYLES, formatCurrency } from './constants'

export function InventoryTable({ products = [], onSelect, onRepredict, onRemove }) {
  const isMobile = useIsMobile()

  if (!products.length) {
    return (
      <EmptyState
        title="No SKUs yet"
        description="Add your first product to start RevenueShield predictions."
        className="m-4 py-12"
      />
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-3 p-4">
        {products.map((product) => (
          <DataCard
            key={product.id}
            title={product.name}
            subtitle={product.sku}
            meta={`${product.store} · Stock ${product.stock} · ${formatCurrency(product.price)}`}
            badges={
              <>
                <Badge variant="outline" className="capitalize rounded-full">{product.category}</Badge>
                <Badge variant="outline" className={`border ${RISK_STYLES[product.risk] || ''}`}>
                  {product.risk}
                </Badge>
                <span className="text-xs font-display font-semibold">
                  {product.predictedShelfDays}d shelf-life
                </span>
              </>
            }
            action={
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
                  title="Re-predict"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRepredict?.(product.id)
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 text-destructive"
                  title="Remove"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove?.(product.id)
                  }}
                >
                  <Plus className="h-4 w-4 rotate-45" />
                </Button>
              </div>
            }
            onClick={() => onSelect?.(product)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/40 hover:bg-transparent">
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Store</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>AI Shelf-life</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="border-border/30 hover:bg-card/80 cursor-pointer"
              onClick={() => onSelect?.(product)}
            >
              <TableCell>
                <div className="font-medium">{product.name}</div>
                <div className="text-xs text-muted-foreground">{product.sku}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize rounded-full">{product.category}</Badge>
              </TableCell>
              <TableCell className="text-sm">{product.store}</TableCell>
              <TableCell className="text-right text-sm">{product.stock}</TableCell>
              <TableCell className="text-right text-sm">{formatCurrency(product.price)}</TableCell>
              <TableCell>
                <span className="font-display font-semibold">{product.predictedShelfDays}d</span>
                <span className="text-xs text-muted-foreground ml-1">predicted</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`border ${RISK_STYLES[product.risk] || ''}`}>
                  {product.risk}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    title="Re-predict"
                    onClick={() => onRepredict?.(product.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    title="Remove"
                    onClick={() => onRemove?.(product.id)}
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
