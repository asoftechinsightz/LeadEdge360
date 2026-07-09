'use client'

import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import {
  Clock,
  Mail,
  MessageCircle,
  CheckSquare,
  Zap,
  GripVertical,
  ArrowRight,
} from 'lucide-react'
import type { WorkflowDraft, WorkflowStep } from '@/components/automation/WorkflowBuilder'

const NODE_META: Record<string, { icon: typeof Mail; color: string }> = {
  trigger: { icon: Zap, color: 'border-violet-500/40 bg-violet-500/10' },
  wait: { icon: Clock, color: 'border-amber-500/40 bg-amber-500/10' },
  send_email: { icon: Mail, color: 'border-sky-500/40 bg-sky-500/10' },
  send_whatsapp: { icon: MessageCircle, color: 'border-emerald-500/40 bg-emerald-500/10' },
  create_task: { icon: CheckSquare, color: 'border-orange-500/40 bg-orange-500/10' },
  condition_no_reply: { icon: Clock, color: 'border-muted bg-muted/30' },
}

function stepLabel(step: WorkflowStep) {
  return step.label || step.type.replace(/_/g, ' ')
}

export type VisualWorkflowProps = {
  value: WorkflowDraft
  onChange: (draft: WorkflowDraft) => void
  className?: string
}

/** Drag-and-drop visual workflow canvas — Trigger → Delay → Action chain. */
export function VisualWorkflow({ value, onChange, className }: VisualWorkflowProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const reorder = useCallback((from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return
    const steps = [...value.steps]
    const [moved] = steps.splice(from, 1)
    steps.splice(to, 0, moved)
    onChange({ ...value, steps })
  }, [onChange, value])

  const triggerLabel = value.trigger.label
    || value.trigger.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <div className={cn('flex min-w-[140px] flex-col gap-1 rounded-xl border-2 p-3 shrink-0', NODE_META.trigger.color)}>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-violet-400">
            <Zap className="size-4" /> Trigger
          </div>
          <p className="text-sm font-medium">{triggerLabel}</p>
        </div>

        <ArrowRight className="size-4 text-muted-foreground shrink-0" aria-hidden />

        {value.steps.map((step, index) => {
          const meta = NODE_META[step.type] || NODE_META.wait
          const Icon = meta.icon
          return (
            <div key={step.id} className="flex items-center gap-2 shrink-0">
              <div
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex != null) reorder(dragIndex, index)
                  setDragIndex(null)
                }}
                onDragEnd={() => setDragIndex(null)}
                className={cn(
                  'flex min-w-[150px] cursor-grab flex-col gap-1 rounded-xl border-2 p-3 active:cursor-grabbing',
                  meta.color,
                  dragIndex === index && 'opacity-60 ring-2 ring-primary',
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <GripVertical className="size-3 opacity-50" />
                    <Icon className="size-3.5" />
                    {step.type === 'wait' ? 'Delay' : step.type === 'create_task' ? 'Task' : 'Action'}
                  </div>
                  <Badge variant="outline" className="text-[9px] h-4 px-1">{index + 1}</Badge>
                </div>
                <p className="text-sm font-medium leading-tight">{stepLabel(step)}</p>
              </div>
              {index < value.steps.length - 1 && (
                <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Drag steps to reorder. Open the workflow builder below to add triggers, delays, email, WhatsApp, and call tasks.
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={() => onChange({
          ...value,
          steps: [
            ...value.steps,
            {
              id: `step-${Date.now()}`,
              type: 'wait',
              delayDays: 1,
              label: 'Wait 1 day',
            },
          ],
        })}
      >
        + Add delay step
      </Button>
    </div>
  )
}

export default VisualWorkflow
