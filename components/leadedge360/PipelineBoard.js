'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { apiPost } from '@/src/lib/api'
import { PIPELINE_COLUMNS } from '@/lib/opportunities/stages'
import { toast } from 'sonner'

function PipelineCard({ item, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      className="cursor-grab rounded-lg border border-border/60 bg-card/90 p-3 shadow-sm active:cursor-grabbing hover:border-primary/30 transition-colors"
    >
      <div className="font-medium text-sm leading-snug">{item.name || item.company}</div>
      <div className="text-xs text-muted-foreground mt-1">{item.company || item.phone}</div>
      <div className="flex items-center justify-between mt-2 gap-2">
        <Badge variant="outline" className="text-[10px] shrink-0">
          {item.label || '—'}
        </Badge>
        <span className="text-xs font-semibold text-primary truncate">
          ₹{Number(item.budget || item.expectedValue || 0).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  )
}

export function PipelineBoard({ items = [], queryKey = ['pipeline'] }) {
  const queryClient = useQueryClient()
  const [dragItem, setDragItem] = useState(null)

  const grouped = useMemo(() => {
    const map = Object.fromEntries(PIPELINE_COLUMNS.map((c) => [c.key, []]))
    for (const item of items) {
      const status = item.status || 'New'
      if (map[status]) map[status].push(item)
      else map.New.push(item)
    }
    return map
  }, [items])

  const moveMutation = useMutation({
    mutationFn: async ({ item, column }) => {
      await apiPost('/opportunities/move', {
        leadId: item.id,
        status: column.key,
        reason: `Pipeline move to ${column.key}`,
      })
    },
    onSuccess: () => {
      toast.success('Stage updated')
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['opportunities', 'dashboard'] })
    },
    onError: (err) => toast.error(err.message || 'Failed to update stage'),
  })

  const onDragStart = (e, item) => {
    setDragItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  const onDrop = (column) => {
    if (!dragItem || dragItem.status === column.key) {
      setDragItem(null)
      return
    }
    moveMutation.mutate({ item: dragItem, column })
    setDragItem(null)
  }

  return (
    <div className="relative -mx-1">
      <div className="flex gap-4 overflow-x-auto pb-4 px-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin]">
        {PIPELINE_COLUMNS.map((column) => (
          <Card
            key={column.key}
            className="flex-shrink-0 w-[min(100%,280px)] snap-start bg-card/50 border-border/60 flex flex-col max-h-[min(70vh,560px)]"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(column)}
          >
            <CardHeader className="py-3 px-4 border-b border-border/40 shrink-0">
              <CardTitle className="text-sm font-medium flex items-center justify-between gap-2">
                <span className="truncate">{column.key}</span>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {grouped[column.key]?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-3 space-y-2 overflow-y-auto flex-1 min-h-[200px]">
              {(grouped[column.key] || []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8 border border-dashed border-border/50 rounded-lg">
                  Drop leads here
                </p>
              )}
              {(grouped[column.key] || []).map((item) => (
                <PipelineCard key={item.id} item={item} onDragStart={onDragStart} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-1 md:hidden">Swipe horizontally to view all pipeline stages</p>
    </div>
  )
}
