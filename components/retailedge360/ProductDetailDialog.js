'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { Sparkles, RefreshCw, MessageCircle, ChevronRight } from 'lucide-react'
import { formatCurrency } from './constants'

export function ProductDetailDialog({ product, open, onOpenChange, onRepredict }) {
  if (!product) return null

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`SKU ${product.sku} — ${product.recommendation}`)}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground text-xs block">SKU</span>{product.sku}</div>
            <div><span className="text-muted-foreground text-xs block">Category</span><span className="capitalize">{product.category}</span></div>
            <div><span className="text-muted-foreground text-xs block">Stock</span>{product.stock}</div>
            <div><span className="text-muted-foreground text-xs block">Price</span>{formatCurrency(product.price)}</div>
            <div><span className="text-muted-foreground text-xs block">Store</span>{product.store}</div>
            <div><span className="text-muted-foreground text-xs block">Days on shelf</span>{product.daysOnShelf}</div>
          </div>
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <div className="font-display font-semibold">RevenueShield AI</div>
              <Badge variant="accent" className="ml-auto">
                {product.predictedShelfDays}d · {product.risk} risk
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mb-2">Engine: {product.engine}</div>
            <div className="text-sm mb-3">
              <span className="text-muted-foreground">Recommendation:</span> {product.recommendation}
            </div>
            <ul className="text-sm space-y-1">
              {(product.reasoning || []).map((reason, i) => (
                <li key={i} className="flex gap-2">
                  <ChevronRight className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => onRepredict?.(product.id)} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-1" /> Re-predict
            </Button>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex-1">
              <Button className="w-full bg-accent hover:bg-accent/90">
                <MessageCircle className="h-4 w-4 mr-1" /> Share via WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
