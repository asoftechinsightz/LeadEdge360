'use client'

import { BusinessCardEditor } from '@/components/growth/BusinessCardEditor'
import { GrowthFeatureGate } from '@/components/growth/GrowthFeatureGate'

export default function BusinessCardPage() {
  return (
    <GrowthFeatureGate feature="business_card">
      <BusinessCardEditor />
    </GrowthFeatureGate>
  )
}
