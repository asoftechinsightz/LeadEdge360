'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { apiPost } from '@/src/lib/api'

function FormDialog({ open, onOpenChange, title, children, onSubmit, loading, submitLabel }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="space-y-4"
        >
          {children}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving…' : submitLabel}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function OpportunityCreateDialog({ open, onOpenChange, onSuccess }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', owner: '', expectedValue: '' })

  const submit = async () => {
    if (!form.name?.trim()) return toast.error('Opportunity name is required')
    setLoading(true)
    toast.loading('Creating opportunity…', { id: 'create-opp' })
    try {
      const result = await apiPost('/opportunities/create', {
        name: form.name.trim(),
        company: form.company.trim(),
        owner: form.owner.trim() || undefined,
        expectedValue: Number(form.expectedValue || 0),
      })
      toast.success('Opportunity created', { id: 'create-opp' })
      onOpenChange(false)
      onSuccess?.()
      if (result?.item?.id) router.push('/opportunities')
      else router.push('/opportunities')
    } catch (error) {
      toast.error(error.message || 'Failed to create opportunity', { id: 'create-opp' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New opportunity"
      onSubmit={submit}
      loading={loading}
      submitLabel="Create opportunity"
    >
      <div>
        <Label>Name *</Label>
        <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <Label>Company</Label>
        <Input className="mt-1" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </div>
      <div>
        <Label>Owner</Label>
        <Input className="mt-1" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
      </div>
      <div>
        <Label>Expected value (₹)</Label>
        <Input type="number" className="mt-1" value={form.expectedValue} onChange={(e) => setForm({ ...form, expectedValue: e.target.value })} />
      </div>
    </FormDialog>
  )
}

export function ProposalCreateDialog({ open, onOpenChange, onSuccess }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ clientName: '', company: '', totalAmount: '' })

  const submit = async () => {
    if (!form.clientName?.trim()) return toast.error('Client name is required')
    setLoading(true)
    toast.loading('Creating proposal…', { id: 'create-prop' })
    try {
      const result = await apiPost('/proposals', {
        clientName: form.clientName.trim(),
        company: form.company.trim(),
        totalAmount: Number(form.totalAmount || 0),
        status: 'DRAFT',
      })
      toast.success('Proposal created', { id: 'create-prop' })
      onOpenChange(false)
      onSuccess?.()
      const proposalId = result?.proposal?.id
      router.push(proposalId ? `/proposals/${proposalId}` : '/proposals')
    } catch (error) {
      toast.error(error.message || 'Failed to create proposal', { id: 'create-prop' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New proposal"
      onSubmit={submit}
      loading={loading}
      submitLabel="Create proposal"
    >
      <div>
        <Label>Client name *</Label>
        <Input className="mt-1" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required />
      </div>
      <div>
        <Label>Company</Label>
        <Input className="mt-1" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </div>
      <div>
        <Label>Total amount (₹)</Label>
        <Input type="number" className="mt-1" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} />
      </div>
    </FormDialog>
  )
}

export function CampaignCreateDialog({ open, onOpenChange, onSuccess }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', channel: 'email', description: '' })

  const submit = async () => {
    if (!form.name?.trim()) return toast.error('Campaign name is required')
    setLoading(true)
    toast.loading('Creating campaign…', { id: 'create-camp' })
    try {
      await apiPost('/campaigns', {
        name: form.name.trim(),
        channel: form.channel,
        status: 'draft',
        description: form.description.trim(),
      })
      toast.success('Campaign created', { id: 'create-camp' })
      onOpenChange(false)
      onSuccess?.()
      router.push('/campaigns')
    } catch (error) {
      toast.error(error.message || 'Failed to create campaign', { id: 'create-camp' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="New campaign"
      onSubmit={submit}
      loading={loading}
      submitLabel="Create campaign"
    >
      <div>
        <Label>Name *</Label>
        <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div>
        <Label>Channel</Label>
        <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['email', 'whatsapp', 'sms', 'social'].map((c) => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea className="mt-1" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
    </FormDialog>
  )
}
