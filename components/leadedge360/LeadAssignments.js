'use client'



import { useState } from 'react'

import { useMutation } from '@tanstack/react-query'

import { Card, CardContent } from '@/components/design-system/core/Card'

import { Button } from '@/components/design-system/core/Button'

import { Label } from '@/components/ui/label'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { EmptyState } from '@/components/design-system/core/EmptyState'

import { apiPost } from '@/src/lib/api'

import { toast } from 'sonner'



function formatDateTime(value) {

  if (!value) return '—'

  const d = new Date(value)

  const day = String(d.getDate()).padStart(2, '0')

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const mon = months[d.getMonth()]

  const year = d.getFullYear()

  let hours = d.getHours()

  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12 || 12

  const mins = String(d.getMinutes()).padStart(2, '0')

  return `${day}-${mon}-${year} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`

}



export function LeadAssignments({ leadId, assignments = [], agents = [], onChanged }) {

  const [assignTo, setAssignTo] = useState('')



  const assignLead = useMutation({

    mutationFn: () => apiPost(`/leads/${leadId}/assign`, { assignedTo: assignTo }),

    onSuccess: () => {

      toast.success('Lead assigned')

      setAssignTo('')

      onChanged?.()

    },

    onError: (err) => toast.error(err.message || 'Failed to assign'),

  })



  return (

    <div className="space-y-4">

      <div className="flex flex-wrap gap-3 items-end">

        <div className="min-w-[200px]">

          <Label>Assign to</Label>

          <Select value={assignTo} onValueChange={setAssignTo}>

            <SelectTrigger className="mt-1"><SelectValue placeholder="Select agent" /></SelectTrigger>

            <SelectContent>

              {agents.map((a) => (

                <SelectItem key={a.id || a.name} value={a.name}>{a.name}</SelectItem>

              ))}

            </SelectContent>

          </Select>

        </div>

        <Button disabled={!assignTo || assignLead.isPending} onClick={() => assignLead.mutate()}>

          Assign

        </Button>

      </div>

      <div className="space-y-2">

        {assignments.length === 0 ? (

          <EmptyState title="No assignment history" className="py-6" />

        ) : (

          assignments.map((a) => (

            <Card key={a.id} className="bg-card/60">

              <CardContent className="p-3 text-sm space-y-1">

                <div className="font-medium">Assigned to {a.assignedTo || a.to || '—'}</div>

                <div className="text-muted-foreground text-xs">

                  Assigned by {a.assignedBy || 'Admin'}

                </div>

                <div className="text-muted-foreground text-xs">

                  {formatDateTime(a.createdAt)}

                </div>

              </CardContent>

            </Card>

          ))

        )}

      </div>

    </div>

  )

}

