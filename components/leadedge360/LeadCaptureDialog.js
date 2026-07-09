'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { apiPost } from '@/src/lib/api'
import { getLeadLinkId } from '@/lib/leads/ids'
import { leadDetailPath } from '@/lib/leads/paths'
import { validateLeadCaptureForm } from '@/lib/leads/validation'
import { Sparkles } from 'lucide-react'
import { TERRITORIES, SOURCES } from './constants'

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  message: '',
  source: 'website',
  territory: 'Bengaluru',
  budget: 0,
  whatsapp: true,
}

export function LeadCaptureDialog({ open, onOpenChange, onSuccess }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(EMPTY_FORM)

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setErrors({})
  }

  const submit = async (e) => {
    e.preventDefault()
    const validation = validateLeadCaptureForm(form)
    if (!validation.ok) {
      setErrors({ form: validation.message })
      return toast.error(validation.message)
    }

    setErrors({})
    setLoading(true)
    toast.loading('Capturing & AI-scoring lead…', { id: 'capture-lead' })
    try {
      const payload = { ...form, phone: validation.phone || form.phone }
      const result = await apiPost('/leads', payload)
      const lead = result?.lead
      const leadId = getLeadLinkId(lead)

      toast.success(
        `Lead saved! Scored ${lead?.score} (${lead?.label}) · routed to ${lead?.assignedTo}`,
        { id: 'capture-lead', duration: 5000 }
      )

      onOpenChange(false)
      resetForm()
      onSuccess?.()

      if (leadId) {
        router.push(leadDetailPath(leadId))
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save lead', { id: 'capture-lead' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v) }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Capture a new lead
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Full name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="mt-1.5"
                placeholder="Rahul Verma"
              />
            </div>
            <div>
              <Label>Phone * (10 digits)</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                inputMode="numeric"
                pattern="[0-9+\s-]{10,14}"
                className="mt-1.5"
                placeholder="9876543210"
              />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <Label>Company</Label>
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label>Source</Label>
            <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Territory</Label>
            <Select value={form.territory} onValueChange={(v) => setForm({ ...form, territory: v })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TERRITORIES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Budget (₹)</Label>
            <Input type="number" min="0" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="mt-1.5" />
          </div>
          <div className="flex items-center gap-3 mt-7">
            <Switch checked={form.whatsapp} onCheckedChange={(v) => setForm({ ...form, whatsapp: v })} />
            <Label>WhatsApp opt-in</Label>
          </div>
          <div className="sm:col-span-2">
            <Label>Message / Intent</Label>
            <Textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1.5"
              placeholder="e.g. Need a demo of LeadEdge360 for our 20 reps. Budget approved."
            />
          </div>
          {errors.form && (
            <p className="sm:col-span-2 text-sm text-destructive">{errors.form}</p>
          )}
          <Button disabled={loading} type="submit" className="sm:col-span-2 rounded-full bg-primary h-11">
            {loading ? 'Scoring…' : (
              <>
                <Sparkles className="h-4 w-4 mr-1" /> Capture & AI-Score
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
