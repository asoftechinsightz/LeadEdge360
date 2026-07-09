'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { IntegrationsSettingsPanel } from '@/components/settings/IntegrationsSettingsPanel'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function IntegrationsSettingsPage() {
  return (
    <div className="container py-10">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
          <Link href="/settings">
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
      </div>
      <PageHeader
        title="Enterprise integrations"
        description="Configure SSO and email sync for your organization."
      />
      <IntegrationsSettingsPanel />
    </div>
  )
}
