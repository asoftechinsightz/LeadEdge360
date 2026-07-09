'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Button } from '@/components/design-system/core/Button'
import { Textarea } from '@/components/design-system/core/Input'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { apiPost } from '@/src/lib/api'
import { toast } from 'sonner'

export function LeadNotes({ leadId, notes = [], onChanged }) {
  const [note, setNote] = useState('')

  const addNote = useMutation({
    mutationFn: () => apiPost(`/leads/${leadId}/notes`, { note }),
    onSuccess: () => {
      setNote('')
      toast.success('Note added')
      onChanged?.()
    },
    onError: (err) => toast.error(err.message || 'Failed to add note'),
  })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Add note</Label>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
        <Button disabled={!note.trim() || addNote.isPending} onClick={() => addNote.mutate()}>
          Save note
        </Button>
      </div>
      <div className="space-y-2">
        {notes.length === 0 ? (
          <EmptyState title="No notes yet" className="py-6" />
        ) : (
          notes.map((n) => (
            <Card key={n.id} className="bg-card/60">
              <CardContent className="p-3 text-sm">{n.note}</CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
