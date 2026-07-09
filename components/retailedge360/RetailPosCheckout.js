'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Button } from '@/components/design-system/core/Button'
import { Badge } from '@/components/design-system/core/Badge'
import { formatCurrency } from './constants'
import { useRetailPosCheckout } from './useRetailPosCheckout'
import { QrCode, Trash2 } from 'lucide-react'

export function RetailPosCheckout() {
  const queryClient = useQueryClient()
  const [skuInput, setSkuInput] = useState('')
  const [cart, setCart] = useState([])
  const [qty, setQty] = useState({})
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [scanning, setScanning] = useState(false)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['retail'] })

  const { checkout, lookupSku, loading } = useRetailPosCheckout({
    onSuccess: () => {
      setCart([])
      setQty({})
      refresh()
    },
  })

  const addSku = async (code) => {
    const value = String(code || skuInput).trim()
    if (!value || scanning) return
    setScanning(true)
    try {
      const product = await lookupSku(value)
      setCart((prev) => (prev.some((p) => p.id === product.id) ? prev : [...prev, product]))
      setQty((prev) => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }))
      setSkuInput('')
    } finally {
      setScanning(false)
    }
  }

  const lineItems = cart.map((p) => ({
    inventoryId: p.id,
    qty: qty[p.id] || 1,
    unitPrice: p.price,
  }))

  const total = cart.reduce((sum, p) => sum + (p.price || 0) * (qty[p.id] || 1), 0)

  return (
    <Card className="bg-card/60 border-border/60">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">POS Checkout</h3>
            <p className="text-xs text-muted-foreground">Scan SKU/barcode · Cash, UPI, or card</p>
          </div>
          <Badge variant="outline">Retail POS</Badge>
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Enter SKU or barcode"
            value={skuInput}
            onChange={(e) => setSkuInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSku()}
          />
          <Button type="button" variant="outline" disabled={scanning} onClick={() => addSku()}>
            <QrCode className="h-4 w-4" />
          </Button>
        </div>

        {cart.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Scan a product to begin</p>
        ) : (
          <ul className="divide-y divide-border/40 rounded-lg border border-border/40">
            {cart.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku} · {formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setQty((q) => ({ ...q, [item.id]: Math.max(1, (q[item.id] || 1) - 1) }))}>−</Button>
                  <span className="w-6 text-center">{qty[item.id] || 1}</span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setQty((q) => ({ ...q, [item.id]: (q[item.id] || 1) + 1 }))}>+</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => { setCart((c) => c.filter((x) => x.id !== item.id)); setQty((q) => { const n = { ...q }; delete n[item.id]; return n }) }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          {['cash', 'upi', 'card'].map((m) => (
            <Button
              key={m}
              type="button"
              size="sm"
              variant={paymentMethod === m ? 'default' : 'outline'}
              onClick={() => setPaymentMethod(m)}
            >
              {m.toUpperCase()}
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/40">
          <p className="text-lg font-semibold">Total: {formatCurrency(total)}</p>
          <Button
            type="button"
            disabled={!cart.length || loading}
            onClick={() => checkout({ items: lineItems, paymentMethod })}
          >
            {loading ? 'Processing…' : 'Complete sale'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
