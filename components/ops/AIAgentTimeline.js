'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { apiGet } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { Button } from '@/components/design-system/core/Button'
import { Badge } from '@/components/design-system/core/Badge'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { cn } from '@/lib/utils'

const AGENT_FILTERS = [
  { id: '', label: 'All AI' },
  { id: 'proposal-ai', label: 'Proposal AI' },
  { id: 'marketing-ai', label: 'Marketing AI' },
  { id: 'sales-ai', label: 'Sales AI' },
  { id: 'lead-qualification-ai', label: 'Lead Qualification AI' },
  { id: 'customer-success-ai', label: 'Customer Success AI' },
  { id: 'finance-ai', label: 'Finance AI' },
  { id: 'ceo-ai', label: 'CEO AI' },
]

export function AIAgentTimeline() {
  const [agentId, setAgentId] = useState('')

  const timelineQuery = useInfiniteQuery({
    queryKey: ['platform', 'ai-timeline', agentId],
    initialPageParam: null,
    queryFn: ({ pageParam }) => apiGet('/platform/ai-timeline', {
      agentId: agentId || undefined,
      limit: 25,
      cursor: pageParam || undefined,
    }),
    getNextPageParam: (last) => last?.nextCursor || undefined,
  })

  const items = timelineQuery.data?.pages.flatMap((p) => p.items || []) || []

  if (timelineQuery.isLoading) {
    return <LoadingState label="Loading AI timeline…" rows={6} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Agent Timeline"
        description="Dedicated timeline for Agentic AI employees across the platform."
      />

      <div className="flex flex-wrap gap-1.5">
        {AGENT_FILTERS.map((f) => (
          <Button
            key={f.id || 'all'}
            size="sm"
            variant={agentId === f.id ? 'default' : 'outline'}
            className="h-7 text-xs"
            onClick={() => setAgentId(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No AI agent activity yet. Agent actions will appear here as they execute.
        </p>
      ) : (
        <ul className="space-y-0">
          {items.map((item, index) => (
            <li key={item.id} className="flex gap-3 relative">
              {index < items.length - 1 && (
                <div className="absolute left-4 top-9 bottom-0 w-px bg-border/50" aria-hidden />
              )}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-border/40 z-10 text-sm">
                🤖
              </div>
              <div className="min-w-0 flex-1 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{item.title}</p>
                  {item.agentId && (
                    <Badge variant="outline" className="text-[10px]">{item.agentId}</Badge>
                  )}
                  {item.status && (
                    <Badge variant="secondary" className="text-[10px]">{item.status}</Badge>
                  )}
                </div>
                <p className="text-sm mt-0.5">
                  {item.leadName && <span className="font-medium">{item.leadName}</span>}
                  {item.companyName && item.companyName !== '—' && (
                    <span className="text-muted-foreground"> · {item.companyName}</span>
                  )}
                </p>
                {item.summary && (
                  <p className="text-xs text-muted-foreground mt-1">{item.summary}</p>
                )}
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {item.relativeTime || item.createdAt}
                </p>
                {item.href && (
                  <Link href={item.href} className="text-xs text-primary hover:underline mt-1 inline-block">
                    View record
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {timelineQuery.hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => timelineQuery.fetchNextPage()}
            disabled={timelineQuery.isFetchingNextPage}
          >
            {timelineQuery.isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}
