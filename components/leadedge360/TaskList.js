'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { apiGet } from '@/src/lib/api'

export function TaskList({ leadId }) {
  const tasksQuery = useQuery({
    queryKey: ['lead', leadId, 'tasks'],
    queryFn: () => apiGet(`/leads/${leadId}/tasks`),
    enabled: !!leadId,
  })

  const tasks = tasksQuery.data?.tasks || []

  if (tasksQuery.isLoading) {
    return <LoadingState label="Loading tasks…" rows={2} />
  }

  if (!tasks.length) {
    return <EmptyState title="No tasks" description="Tasks created for this lead will appear here." className="py-6" />
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Card key={task.id} className="bg-card/60">
          <CardContent className="p-4 text-sm flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="font-medium">{task.title}</div>
              {task.description && <p className="text-muted-foreground mt-1">{task.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{task.status || 'open'}</Badge>
              {task.dueAt && (
                <span className="text-xs text-muted-foreground">
                  Due {new Date(task.dueAt).toLocaleString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
