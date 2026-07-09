'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/design-system/core/Button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { apiDelete, apiPost } from '@/src/lib/api'
import { LEADS_LIST_PATH } from '@/lib/leads/paths'
import { toast } from 'sonner'

export function LeadDeleteButton({ leadId, leadName, deletedAt, onRestored }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const deleteLead = useMutation({
    mutationFn: () => apiDelete(`/leads/${leadId}`),
    onSuccess: () => {
      toast.success('Lead deleted')
      setOpen(false)
      router.push(LEADS_LIST_PATH)
    },
    onError: (err) => toast.error(err.message || 'Failed to delete lead'),
  })

  const restoreLead = useMutation({
    mutationFn: () => apiPost(`/leads/${leadId}`, { action: 'restore' }),
    onSuccess: () => {
      toast.success('Lead restored')
      onRestored?.()
    },
    onError: (err) => toast.error(err.message || 'Failed to restore lead'),
  })

  if (deletedAt) {
    return (
      <Button variant="outline" size="sm" disabled={restoreLead.isPending} onClick={() => restoreLead.mutate()}>
        Restore lead
      </Button>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete lead?</AlertDialogTitle>
          <AlertDialogDescription>
            {leadName ? `"${leadName}"` : 'This lead'} will be hidden from standard lists. An audit entry will be recorded.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteLead.isPending}
            onClick={(e) => {
              e.preventDefault()
              deleteLead.mutate()
            }}
          >
            {deleteLead.isPending ? 'Deleting…' : 'Delete lead'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
