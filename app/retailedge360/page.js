'use client'

import { RetailDashboard } from '@/components/retailedge360'
import { GrowthFeatureGate } from '@/components/growth/GrowthFeatureGate'

export default function RetailEdge360Page() {
  return (
    <GrowthFeatureGate feature="retail_inventory">
      <RetailDashboard />
    </GrowthFeatureGate>
  )
}
