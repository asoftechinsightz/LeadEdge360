'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { LeadDetailTabs } from '@/components/leadedge360'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { LEADS_LIST_PATH } from '@/lib/leads/paths'

export default function LeadEdgeLeadDetailPage() {
  const params = useParams()
  const leadId = params?.id

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={LEADS_LIST_PATH}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to leads
        </Link>
      </Button>
      <LeadDetailTabs leadId={leadId} />
    </div>
  )
}
