'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Button } from '@/components/design-system/core/Button'
import { Input } from '@/components/design-system/core/Input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { apiPost } from '@/src/lib/api'
import { toast } from 'sonner'

export function FollowupList({ leadId, followups = [], onChanged }) {
  const [form, setForm] = useState({ title: '', dueAt: '' })

  const addFollowup = useMutation({
    mutationFn: () => apiPost(`/leads/${leadId}/followups`, form),
    onSuccess: () => {
      setForm({ title: '', dueAt: '' })
      toast.success('Follow-up scheduled')
      onChanged?.()
    },
    onError: (err) => toast.error(err.message || 'Failed to schedule follow-up'),
  })

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Title</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" />
        </div>
        <div>
          <Label>Due at</Label>
          <Input
            type="datetime-local"
            value={form.dueAt}
            onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
      <Button
        disabled={!form.title || !form.dueAt || addFollowup.isPending}
        onClick={() => addFollowup.mutate()}
      >
        Schedule follow-up
      </Button>
      <div className="space-y-2">
        {followups.length === 0 ? (
          <EmptyState title="No follow-ups" description="Schedule the next touchpoint for this lead." className="py-6" />
        ) : (
          followups.map((f) => (
            <Card key={f.id} className="bg-card/60">
              <CardContent className="p-3 text-sm flex justify-between gap-3">
                <span>{f.title}</span>
                <span className="text-muted-foreground text-xs shrink-0">
                  {f.dueAt ? new Date(f.dueAt).toLocaleString() : ''}
                </span>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
