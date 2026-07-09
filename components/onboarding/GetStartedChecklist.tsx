'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { apiGet } from '@/src/lib/api'
import { cn } from '@/lib/utils'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'
import { LEADS_TOUR_URL } from '@/lib/leads/paths'

type GetStartedChecklistProps = {
  collapsed?: boolean
  className?: string
}

const TASKS = [
  { key: 'companyName', label: 'Add company profile', href: '/onboarding' },
  { key: 'demoLeadsImported', label: 'Load demo pipeline', href: '/onboarding?step=2' },
  { key: 'aiScoreViewed', label: 'Review AI scores', href: LEADS_TOUR_URL },
] as const

export function GetStartedChecklist({ collapsed, className }: GetStartedChecklistProps) {
  const statusQuery = useQuery({
    queryKey: ['lead-onboarding-status'],
    queryFn: () => apiGet('/onboarding/lead-step'),
    staleTime: 30_000,
    retry: false,
  })

  const state = statusQuery.data?.state
  if (!state?.required || state.complete) return null

  const setup = statusQuery.data?.progress?.leadQuickSetup || {}
  const doneCount = TASKS.filter((t) => setup[t.key] === true).length

  if (collapsed) {
    return (
      <div className={cn('px-2 py-2', className)} title="Get started checklist">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary text-xs font-bold mx-auto">
          {doneCount}/3
        </div>
      </div>
    )
  }

  return (
    <div className={cn('mx-2 mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3', className)}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Get Started</p>
        <span className="text-[10px] text-muted-foreground">{doneCount}/3</span>
      </div>
      <ul className="space-y-1.5">
        {TASKS.map((task) => {
          const done = setup[task.key] === true
          const Icon = done ? CheckCircle2 : Circle
          return (
            <li key={task.key}>
              <Link
                href={task.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-1.5 py-1 text-[11px] transition-colors hover:bg-muted/50',
                  done ? 'text-muted-foreground line-through' : 'text-foreground font-medium',
                )}
              >
                <Icon className={cn('size-3.5 shrink-0', done ? 'text-emerald-500' : 'text-muted-foreground')} />
                <span className="flex-1 truncate">{task.label}</span>
                {!done && <ArrowRight className="size-3 opacity-60" />}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default GetStartedChecklist
