'use client'

import { useCallback, useState } from 'react'
import { Button } from '@/components/design-system/core/Button'
import { Badge } from '@/components/design-system/core/Badge'
import {
  GripVertical,
  Mail,
  MessageCircle,
  Clock,
  GitBranch,
  Zap,
  Plus,
  Trash2,
  ArrowDown,
  CheckSquare,
} from 'lucide-react'

export type WorkflowStep = {
  id: string
  type: 'wait' | 'send_email' | 'send_whatsapp' | 'condition_no_reply' | 'create_task'
  label?: string
  delayDays?: number
  waitDays?: number
  templateId?: string
  templateKey?: string
  emailTemplateId?: string
  taskTitle?: string
  dueDays?: number
  priority?: string
}

export type WorkflowTrigger = {
  type: 'lead_created' | 'stage_change' | 'no_reply_3_days'
  label?: string
  stage?: string
}

export type WorkflowDraft = {
  name: string
  trigger: WorkflowTrigger
  steps: WorkflowStep[]
}

const TRIGGER_OPTIONS: { value: WorkflowTrigger['type']; label: string }[] = [
  { value: 'lead_created', label: 'New Lead' },
  { value: 'stage_change', label: 'Stage Change' },
  { value: 'no_reply_3_days', label: 'No reply 3 days' },
]

const STEP_PALETTE: { type: WorkflowStep['type']; label: string; icon: typeof Mail; defaults: Partial<WorkflowStep> }[] = [
  { type: 'wait', label: 'Wait', icon: Clock, defaults: { delayDays: 1, label: 'Wait 1 day' } },
  { type: 'send_email', label: 'Send Email', icon: Mail, defaults: { label: 'Send email', templateKey: 'custom_email' } },
  { type: 'condition_no_reply', label: 'If no reply', icon: GitBranch, defaults: { waitDays: 3, label: 'If no reply (3 days)' } },
  { type: 'send_whatsapp', label: 'Send WhatsApp', icon: MessageCircle, defaults: { templateId: 'new_lead', label: 'Send WhatsApp' } },
  { type: 'create_task', label: 'Create Task', icon: CheckSquare, defaults: { label: 'Schedule call', taskTitle: 'Call {{name}}', dueDays: 0 } },
]

function stepIcon(type: WorkflowStep['type']) {
  const found = STEP_PALETTE.find((p) => p.type === type)
  const Icon = found?.icon || Zap
  return <Icon className="size-4 shrink-0" />
}

function newStepId() {
  return `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

export type WorkflowBuilderProps = {
  value: WorkflowDraft
  onChange: (draft: WorkflowDraft) => void
  onSave?: () => void
  saving?: boolean
}

export function WorkflowBuilder({ value, onChange, onSave, saving }: WorkflowBuilderProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const updateStep = useCallback((index: number, patch: Partial<WorkflowStep>) => {
    const steps = value.steps.map((s, i) => (i === index ? { ...s, ...patch } : s))
    onChange({ ...value, steps })
  }, [onChange, value])

  const removeStep = useCallback((index: number) => {
    onChange({ ...value, steps: value.steps.filter((_, i) => i !== index) })
  }, [onChange, value])

  const addStep = useCallback((type: WorkflowStep['type']) => {
    const palette = STEP_PALETTE.find((p) => p.type === type)
    const step: WorkflowStep = {
      id: newStepId(),
      type,
      ...palette?.defaults,
    }
    onChange({ ...value, steps: [...value.steps, step] })
  }, [onChange, value])

  const moveStep = useCallback((from: number, to: number) => {
    if (to < 0 || to >= value.steps.length) return
    const steps = [...value.steps]
    const [item] = steps.splice(from, 1)
    steps.splice(to, 0, item)
    onChange({ ...value, steps })
  }, [onChange, value])

  const onDrop = useCallback((toIndex: number) => {
    if (dragIndex === null || dragIndex === toIndex) return
    moveStep(dragIndex, toIndex)
    setDragIndex(null)
  }, [dragIndex, moveStep])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Workflow name</label>
          <input
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="My nurture flow"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Trigger</label>
          <select
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={value.trigger.type}
            onChange={(e) => onChange({
              ...value,
              trigger: { ...value.trigger, type: e.target.value as WorkflowTrigger['type'] },
            })}
          >
            {TRIGGER_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {value.trigger.type === 'stage_change' && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">Stage</label>
          <select
            className="mt-1 w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={value.trigger.stage || 'Proposal'}
            onChange={(e) => onChange({ ...value, trigger: { ...value.trigger, stage: e.target.value } })}
          >
            {['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Add step</p>
        <div className="flex flex-wrap gap-2">
          {STEP_PALETTE.map((p) => (
            <Button key={p.type} type="button" size="sm" variant="outline" className="rounded-full" onClick={() => addStep(p.type)}>
              <p.icon className="size-3.5 mr-1.5" />
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-0">
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Zap className="size-4" />
          </div>
          <div>
            <p className="font-medium text-sm">If {TRIGGER_OPTIONS.find((t) => t.value === value.trigger.type)?.label}</p>
            <p className="text-xs text-muted-foreground">Workflow starts automatically</p>
          </div>
        </div>

        {value.steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div className="py-2 text-muted-foreground">
              <ArrowDown className="size-4" />
            </div>
            <div
              className="w-full rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm"
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(index)}
            >
              <div className="flex items-start gap-3">
                <button type="button" className="mt-1 cursor-grab text-muted-foreground hover:text-foreground" aria-label="Drag to reorder">
                  <GripVertical className="size-4" />
                </button>
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted shrink-0">
                  {stepIcon(step.type)}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-sm">{step.label || step.type}</p>
                    <Badge variant="outline" className="text-[10px] capitalize">{step.type.replace(/_/g, ' ')}</Badge>
                  </div>

                  {step.type === 'wait' && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Delay</span>
                      <input
                        type="number"
                        min={0}
                        className="w-16 rounded border border-border bg-background px-2 py-1"
                        value={step.delayDays ?? 1}
                        onChange={(e) => updateStep(index, { delayDays: Number(e.target.value), label: `Wait ${e.target.value} day(s)` })}
                      />
                      <span className="text-muted-foreground">day(s)</span>
                    </div>
                  )}

                  {step.type === 'condition_no_reply' && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Wait up to</span>
                      <input
                        type="number"
                        min={1}
                        className="w-16 rounded border border-border bg-background px-2 py-1"
                        value={step.waitDays ?? 3}
                        onChange={(e) => updateStep(index, { waitDays: Number(e.target.value), label: `If no reply (${e.target.value} days)` })}
                      />
                      <span className="text-muted-foreground">days for reply</span>
                    </div>
                  )}

                  {step.type === 'send_whatsapp' && (
                    <select
                      className="w-full max-w-xs rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                      value={step.templateId || 'new_lead'}
                      onChange={(e) => updateStep(index, { templateId: e.target.value })}
                    >
                      <option value="new_lead">New Lead intro</option>
                      <option value="follow_up">Follow-up</option>
                      <option value="proposal_sent">Proposal sent</option>
                    </select>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Button type="button" size="icon" variant="ghost" className="size-8" onClick={() => moveStep(index, index - 1)} disabled={index === 0}>↑</Button>
                  <Button type="button" size="icon" variant="ghost" className="size-8" onClick={() => moveStep(index, index + 1)} disabled={index === value.steps.length - 1}>↓</Button>
                  <Button type="button" size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => removeStep(index)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {value.steps.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Add steps below the trigger — e.g. Wait → Email → If no reply → WhatsApp
          </p>
        )}
      </div>

      {onSave && (
        <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
          <Button type="button" onClick={onSave} disabled={saving || !value.name.trim() || value.steps.length === 0}>
            <Plus className="size-4 mr-1.5" />
            {saving ? 'Saving…' : 'Save workflow'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default WorkflowBuilder
