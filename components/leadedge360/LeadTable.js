'use client'

import Link from 'next/link'
import { getLeadLinkId } from '@/lib/leads/ids'
import { leadDetailPath } from '@/lib/leads/paths'
import { Badge } from '@/components/design-system/core/Badge'
import { Button } from '@/components/design-system/core/Button'
import { DataCard } from '@/components/design-system/core/DataCard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/design-system/core/Table'
import { LeadsEmpty } from '@/components/empty-states/LeadsEmpty'
import { useIsMobile } from '@/hooks/use-mobile'
import { ChevronRight } from 'lucide-react'
import { AIScoreBadge } from '@/components/leads/AIScoreBadge'

const STATUS_COLORS = {
  New: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Contacted: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Qualified: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Proposal: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
  Won: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Lost: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
}

const LABEL_COLORS = {
  Hot: 'bg-primary/20 text-primary border-primary/40',
  Warm: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Cold: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  Platinum: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
}

export function LeadTable({ leads = [], emptyMessage = 'No leads found.', onEmptyAction }) {
  const isMobile = useIsMobile()

  if (!leads.length) {
    return <LeadsEmpty onImported={onEmptyAction} className="m-4" />
  }

  if (isMobile) {
    return (
      <div className="space-y-3 p-4">
        {leads.map((lead) => {
          const linkId = getLeadLinkId(lead)
          if (!linkId) return null
          return (
          <DataCard
            key={linkId}
            title={lead.name}
            subtitle={`${lead.company || '—'} · ${lead.phone}`}
            meta={`${lead.territory || '—'} · ${lead.assignedTo || 'Unassigned'}`}
            badges={
              <>
                <Badge variant="outline" className="capitalize rounded-full">{lead.source}</Badge>
                {lead.label && (
                  <Badge className={`border ${LABEL_COLORS[lead.label] || ''}`} variant="outline">
                    {lead.label}
                  </Badge>
                )}
                <Badge variant="outline" className={`border ${STATUS_COLORS[lead.status] || ''}`}>
                  {lead.status}
                </Badge>
                <span className="text-xs font-display font-bold text-foreground">
                  <AIScoreBadge
                    closeProbability={lead.closeProbability ?? lead.score}
                    label={lead.label}
                    reasons={lead.predictiveReasons || lead.reasons}
                    engine={lead.scoringEngine}
                    compact
                  />
                </span>
              </>
            }
            action={
              <Button asChild size="sm" variant="ghost">
                <Link href={leadDetailPath(linkId)} aria-label={`View ${lead.name}`}>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />
          )
        })}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/40 hover:bg-transparent">
            <TableHead>Lead</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Territory</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => {
            const linkId = getLeadLinkId(lead)
            if (!linkId) return null
            return (
            <TableRow key={linkId} className="border-border/30 hover:bg-card/80">
              <TableCell>
                <div className="font-medium">{lead.name}</div>
                <div className="text-xs text-muted-foreground">
                  {lead.company || '—'} · {lead.phone}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize rounded-full">
                  {lead.source}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{lead.territory || '—'}</TableCell>
              <TableCell className="text-sm">{lead.assignedTo || '—'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2" data-tour={leads.indexOf(lead) === 0 ? 'ai-score' : undefined}>
                  <AIScoreBadge
                    closeProbability={lead.closeProbability ?? lead.score}
                    score={lead.score}
                    label={lead.label}
                    reasons={lead.predictiveReasons || lead.reasons}
                    engine={lead.scoringEngine}
                    compact
                  />
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`border ${STATUS_COLORS[lead.status] || ''}`}>
                  {lead.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="ghost">
                  <Link href={leadDetailPath(linkId)}>
                    Details <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
