'use client'

import { PageHeader } from '@/components/design-system/core/PageHeader'
import { SettingsModule } from '@/components/suite/SettingsModule'

export default function SettingsPage() {
  return (
    <div className="container py-10">
      <PageHeader
        title="Settings"
        description="Configure your workspace and manage team access."
      />
      <SettingsModule />
    </div>
  )
}
