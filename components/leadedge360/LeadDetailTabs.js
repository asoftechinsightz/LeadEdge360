'use client'

import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { apiGet } from '@/src/lib/api'
import { LeadOverview } from './LeadOverview'
import { ActivityTimeline } from './ActivityTimeline'
import { LeadNotes } from './LeadNotes'
import { FollowupList } from './FollowupList'
import { LeadAssignments } from './LeadAssignments'
import { TaskList } from './TaskList'
import { LeadAiPanel } from './LeadAiPanel'
import { LeadDeleteButton } from './LeadDeleteButton'
import { LeadAttachments } from './LeadAttachments'
import { LeadDetailActions } from '@/components/leads/LeadDetailActions'
import { LEADS_LIST_PATH } from '@/lib/leads/paths'
import { ArrowLeft } from 'lucide-react'

export function LeadDetailTabs({ leadId }) {
  const queryClient = useQueryClient()

  const leadQuery = useQuery({
    queryKey: ['lead', leadId],
    queryFn: () => apiGet(`/leads/${leadId}`),
    enabled: !!leadId,
  })

  const timelineQuery = useQuery({
    queryKey: ['lead', leadId, 'timeline'],
    queryFn: () => apiGet(`/leads/${leadId}/timeline`),
    enabled: !!leadId,
  })

  const notesQuery = useQuery({
    queryKey: ['lead', leadId, 'notes'],
    queryFn: () => apiGet(`/leads/${leadId}/notes`),
    enabled: !!leadId,
  })

  const followupsQuery = useQuery({
    queryKey: ['lead', leadId, 'followups'],
    queryFn: () => apiGet(`/leads/${leadId}/followups`),
    enabled: !!leadId,
  })

  const assignmentsQuery = useQuery({
    queryKey: ['lead', leadId, 'assignments'],
    queryFn: () => apiGet(`/leads/${leadId}/assignments`),
    enabled: !!leadId,
  })

  const agentsQuery = useQuery({
    queryKey: ['agents'],
    queryFn: () => apiGet('/agents'),
  })

  const lead = leadQuery.data?.lead || leadQuery.data
  const timeline = timelineQuery.data?.timeline || leadQuery.data?.timeline || []
  const notes = notesQuery.data?.notes || leadQuery.data?.notes || []
  const followups = followupsQuery.data?.followups || leadQuery.data?.followups || []
  const assignments = assignmentsQuery.data?.assignments || leadQuery.data?.assignments || []
  const agents = agentsQuery.data?.agents || []

  const refreshTimeline = () => {
    timelineQuery.refetch()
    queryClient.invalidateQueries({ queryKey: ['lead', leadId] })
  }

  if (!leadId) {
    return (
      <EmptyState
        title="Invalid lead link"
        description="No lead id was provided in the URL."
        className="m-8"
      />
    )
  }

  if (leadQuery.isLoading) {
    return <LoadingState label="Loading lead…" className="m-8" />
  }

  if (leadQuery.isError) {
    const message = leadQuery.error?.message || 'Unable to load this lead.'
    console.error('[LeadDetailTabs] load failed', { leadId, error: leadQuery.error })
    return (
      <div className="m-8 space-y-4">
        <EmptyState
          title="Lead not found"
          description={message}
        />
        <Button asChild variant="outline" size="sm">
          <Link href={LEADS_LIST_PATH}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to leads
          </Link>
        </Button>
      </div>
    )
  }

  if (!lead?.id && !lead?.name) {
    console.warn('[LeadDetailTabs] empty lead payload', { leadId, data: leadQuery.data })
    return (
      <div className="m-8 space-y-4">
        <EmptyState
          title="Lead not found"
          description="This lead may have been deleted or belongs to another organization."
        />
        <Button asChild variant="outline" size="sm">
          <Link href={LEADS_LIST_PATH}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to leads
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{lead.name}</h1>
          <p className="text-muted-foreground mt-1">
            {lead.company || '—'} · {lead.phone}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{lead.status}</Badge>
          <LeadDeleteButton
            leadId={leadId}
            leadName={lead.name}
            deletedAt={lead.deletedAt}
            onRestored={() => leadQuery.refetch()}
          />
        </div>
      </div>

      <LeadDetailActions
        leadId={leadId}
        lead={lead}
        onSent={() => {
          leadQuery.refetch()
          refreshTimeline()
        }}
      />

      <LeadAiPanel
        leadId={leadId}
        lead={lead}
        onScored={() => leadQuery.refetch()}
      />

      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="followups">Follow-ups</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <LeadOverview
            lead={lead}
            leadId={leadId}
            onChanged={() => {
              leadQuery.refetch()
              refreshTimeline()
              queryClient.invalidateQueries({ queryKey: ['lead', leadId, 'assignments'] })
            }}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <ActivityTimeline items={timeline} />
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <LeadNotes leadId={leadId} notes={notes} onChanged={() => { notesQuery.refetch(); refreshTimeline() }} />
        </TabsContent>

        <TabsContent value="followups" className="mt-4">
          <FollowupList
            leadId={leadId}
            followups={followups}
            onChanged={() => { followupsQuery.refetch(); refreshTimeline() }}
          />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <TaskList leadId={leadId} />
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          <LeadAssignments
            leadId={leadId}
            assignments={assignments}
            agents={agents}
            onChanged={() => { assignmentsQuery.refetch(); refreshTimeline(); leadQuery.refetch() }}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <LeadAttachments leadId={leadId} onChanged={refreshTimeline} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
