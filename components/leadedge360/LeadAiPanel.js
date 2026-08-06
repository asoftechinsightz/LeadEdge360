'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { apiPost } from '@/src/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/core/Card'
import { Button } from '@/components/design-system/core/Button'
import { Badge } from '@/components/design-system/core/Badge'
import { Sparkles, Target } from 'lucide-react'
import { toast } from 'sonner'
import { AIScoreBadge } from '@/components/leads/AIScoreBadge'

export function LeadAiPanel({ leadId, lead, onScored }) {
  const [suggestion, setSuggestion] = useState('')
  const [scoreResult, setScoreResult] = useState(null)

  const suggestMutation = useMutation({
    mutationFn: (intent) =>
      apiPost('/ai/suggest', { leadId, intent, lead }),
    onSuccess: (data) => {
      setSuggestion(data?.data?.suggestion || data?.suggestion || '')
      toast.success('AI suggestion ready')
    },
    onError: (err) => toast.error(err?.message || 'Suggestion failed'),
  })

  const scoreMutation = useMutation({
    mutationFn: () => apiPost('/ai/score', { leadId }),
    onSuccess: (data) => {
      const result = data?.data || data
      if (data?.locked || result?.locked) {
        toast.error('Upgrade to unlock AI scoring', {
          action: (data?.upgradeUrl || result?.upgradeUrl)
            ? { label: 'Upgrade', onClick: () => { window.location.href = data?.upgradeUrl || result?.upgradeUrl } }
            : undefined,
        })
        return
      }
      setScoreResult(result)
      onScored?.(result)
      toast.success(`${result.closeProbability ?? result.score}% chance to close (${result.label})`)
    },
    onError: (err) => {
      const error = err || {}
      if (error?.locked || error?.code === 'FEATURE_LOCKED') {
        toast.error('Upgrade to unlock AI scoring', {
          action: error?.upgradeUrl
            ? { label: 'Upgrade', onClick: () => { window.location.href = error.upgradeUrl } }
            : undefined,
        })
        return
      }
      toast.error(err?.message || 'Scoring failed')
    },
  })

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={suggestMutation.isPending}
            onClick={() => suggestMutation.mutate('followup')}
          >
            Suggest follow-up
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={suggestMutation.isPending}
            onClick={() => suggestMutation.mutate('proposal')}
          >
            Suggest proposal
          </Button>
          <Button
            size="sm"
            disabled={scoreMutation.isPending}
            onClick={() => scoreMutation.mutate()}
          >
            <Target className="size-3.5 mr-1" />
            Score lead
          </Button>
        </div>

        {suggestion ? (
          <div className="rounded-lg border border-border/60 bg-background p-3 text-sm">
            <p className="text-xs text-muted-foreground mb-1">Suggested reply</p>
            <p className="whitespace-pre-wrap">{suggestion}</p>
          </div>
        ) : null}

        {scoreResult ? (
          <AIScoreBadge
            closeProbability={scoreResult.closeProbability ?? scoreResult.score}
            score={scoreResult.score}
            label={scoreResult.label}
            reasons={scoreResult.reasons}
            engine={scoreResult.engine}
          />
        ) : lead?.score != null ? (
          <AIScoreBadge
            closeProbability={lead.closeProbability ?? lead.score}
            score={lead.score}
            label={lead.label}
            reasons={lead.predictiveReasons || lead.reasons}
            engine={lead.scoringEngine}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}
