'use client'

import { Badge } from '@/components/design-system/core/Badge'
import { Sparkles } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type AIScoreBadgeProps = {
  closeProbability?: number | null
  score?: number | null
  label?: string | null
  reasons?: string[]
  engine?: string | null
  compact?: boolean
  className?: string
}

const LABEL_STYLES: Record<string, string> = {
  Hot: 'bg-red-500/15 text-red-400 border-red-500/30',
  Warm: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Cold: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
}

export function AIScoreBadge({
  closeProbability,
  score,
  label,
  reasons = [],
  engine,
  compact = false,
  className = '',
}: AIScoreBadgeProps) {
  const probability = closeProbability ?? score
  if (probability == null && !label) return null

  const pct = probability != null ? Math.round(probability) : null
  const labelStyle = LABEL_STYLES[label || ''] || 'bg-primary/15 text-primary border-primary/30'

  const content = (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {pct != null && (
        <span className={`inline-flex items-center gap-1 font-display font-bold ${compact ? 'text-xs' : 'text-sm'}`}>
          <Sparkles className={`${compact ? 'size-3' : 'size-3.5'} text-primary`} />
          {pct}% chance to close
        </span>
      )}
      {label && (
        <Badge variant="outline" className={`border ${labelStyle} ${compact ? 'text-[10px] px-1.5 py-0' : ''}`}>
          {label}
        </Badge>
      )}
      {engine === 'predictive' && !compact && (
        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
          AI trained
        </Badge>
      )}
    </div>
  )

  if (!reasons.length) return content

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-left">{content}</button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <p className="text-xs font-semibold mb-1">Why this score</p>
          <ul className="text-xs space-y-1 text-muted-foreground">
            {reasons.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
