'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { Input } from '@/components/design-system/core/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { apiPost } from '@/src/lib/api'
import { Sparkles } from 'lucide-react'
import { CATEGORIES } from './constants'

export function ProductCaptureDialog({ open, onOpenChange, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'dairy',
    price: 100,
    stock: 50,
    daysOnShelf: 1,
    store: 'Default Store',
  })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.sku) return toast.error('Name & SKU required')
    setLoading(true)
    toast.loading('Predicting shelf-life with RevenueShield AI…', { id: 'retail-sku' })
    try {
      const result = await apiPost('/retail/inventory', form)
      setLoading(false)
      const product = result.product || result.data
      toast.success(
        `${product.predictedShelfDays}d shelf-life · ${product.risk} risk`,
        { id: 'retail-sku', duration: 5000 }
      )
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      setLoading(false)
      toast.error(error.message || 'Failed', { id: 'retail-sku' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" /> Add SKU
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Product name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1.5" />
          </div>
          <div>
            <Label>SKU *</Label>
            <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required className="mt-1.5" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Store</Label>
            <Input value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Price (₹)</Label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Stock</Label>
            <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Days on shelf</Label>
            <Input type="number" value={form.daysOnShelf} onChange={(e) => setForm({ ...form, daysOnShelf: e.target.value })} className="mt-1.5" />
          </div>
          <Button disabled={loading} className="sm:col-span-2 rounded-full bg-accent h-11">
            {loading ? 'Predicting…' : (
              <>
                <Sparkles className="h-4 w-4 mr-1" /> Add & Predict Shelf-life
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
