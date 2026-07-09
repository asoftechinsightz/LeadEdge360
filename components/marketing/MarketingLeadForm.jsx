'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const DEFAULT_FIELDS = ['name', 'email', 'company', 'phone', 'message']

export default function MarketingLeadForm({
  source = 'book-demo',
  product = '',
  title = 'Book your free demo',
  description = 'Our team will reach out within a few hours.',
  fields = DEFAULT_FIELDS,
  submitLabel = 'Submit',
  className = '',
  onSuccess,
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    industry: '',
    message: '',
    product,
  })

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/marketing/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, product: form.product || product, source }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      toast.success("Thanks! We'll be in touch shortly.")
      setForm({ name: '', email: '', company: '', phone: '', industry: '', message: '', product })
      onSuccess?.(data)
    } catch (err) {
      toast.error(err.message || 'Could not submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('gix-glass rounded-2xl border border-border p-8', className)}>
      {title && <h3 className="font-display text-2xl font-bold text-foreground">{title}</h3>}
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      <form onSubmit={submit} className="mt-6 grid sm:grid-cols-2 gap-4">
        {fields.includes('name') && (
          <Input required placeholder="Full name" value={form.name} onChange={(e) => update('name', e.target.value)} />
        )}
        {fields.includes('email') && (
          <Input required type="email" placeholder="Work email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        )}
        {fields.includes('company') && (
          <Input placeholder="Company" value={form.company} onChange={(e) => update('company', e.target.value)} />
        )}
        {fields.includes('phone') && (
          <Input placeholder="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        )}
        {fields.includes('industry') && (
          <Input placeholder="Industry" value={form.industry} onChange={(e) => update('industry', e.target.value)} className="sm:col-span-2" />
        )}
        {fields.includes('message') && (
          <Textarea
            rows={4}
            placeholder="Tell us about your goals…"
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            className="sm:col-span-2"
          />
        )}
        <Button disabled={loading} className="sm:col-span-2 rounded-full bg-[#0066FF] hover:bg-[#00C6FF] h-11">
          {loading ? 'Submitting…' : submitLabel}
        </Button>
      </form>
    </div>
  )
}
