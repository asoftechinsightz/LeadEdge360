'use client'

import { ExpiryManagement } from '@/components/retailedge360/expiry'
import { GrowthFeatureGate } from '@/components/growth/GrowthFeatureGate'

export default function ExpiryManagementPage() {
  return (
    <GrowthFeatureGate feature="retail_expiry">
      <ExpiryManagement />
    </GrowthFeatureGate>
  )
}
