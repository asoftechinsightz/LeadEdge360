'use client'



import { Card, CardContent } from '@/components/design-system/core/Card'

import { EmptyState } from '@/components/design-system/core/EmptyState'



const TYPE_LABELS = {

  note: 'Note Added',

  status_change: 'Status Changed',

  assigned: 'Lead Assigned',

  followup: 'Follow-up Scheduled',

  task: 'Task Created',

  call: 'Call Logged',

  email: 'Email Sent',

}



function formatDate(value) {

  if (!value) return ''

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



function describeEvent(ev) {

  const payload = ev.payload || {}

  if (ev.type === 'note' && payload.note) return payload.note

  if (ev.description) return ev.description

  if (ev.type === 'status_change') {

    return `Status changed from ${payload.from || '—'} to ${payload.to || '—'}`

  }

  if (ev.type === 'assigned') {

    return payload.to ? `Assigned to ${payload.to}` : 'Lead reassigned'

  }

  if (typeof payload === 'object' && payload.note) return payload.note

  if (typeof payload === 'string') return payload

  return null

}



export function ActivityTimeline({ items = [] }) {

  if (!items.length) {

    return <EmptyState title="No timeline events" description="Activity will appear as the lead progresses." />

  }



  return (

    <div className="space-y-3">

      {items.map((ev) => {

        const title = TYPE_LABELS[ev.type] || ev.title || ev.type || 'Activity'

        const body = describeEvent(ev)

        return (

          <Card key={ev.id} className="bg-card/60">

            <CardContent className="p-4 text-sm">

              <div className="font-medium">{title}</div>

              {body && <p className="mt-2 text-foreground">{body}</p>}

              <div className="text-muted-foreground text-xs mt-2">

                {formatDate(ev.createdAt)}

              </div>

            </CardContent>

          </Card>

        )

      })}

    </div>

  )

}

