'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { CampaignDetailPanel } from '@/components/suite/CampaignDetailPanel'
import { Button } from '@/components/ui/button'

export default function CampaignDetailPage() {
  const params = useParams()
  const id = params?.id

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaign detail"
        description="Manage status, attach templates, and execute."
        actions={
          <Button variant="outline" asChild>
            <Link href="/campaigns">Back to campaigns</Link>
          </Button>
        }
      />
      <CampaignDetailPanel campaignId={id} />
    </div>
  )
}
