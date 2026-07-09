'use client'

import { ReviewDashboard } from '@/components/growth/ReviewDashboard'
import { GrowthFeatureGate } from '@/components/growth/GrowthFeatureGate'

export default function ReviewsPage() {
  return (
    <GrowthFeatureGate feature="reviews">
      <ReviewDashboard />
    </GrowthFeatureGate>
  )
}
