'use client'

import { QrManager } from '@/components/growth/QrManager'
import { GrowthFeatureGate } from '@/components/growth/GrowthFeatureGate'

export default function QrPage() {
  return (
    <GrowthFeatureGate feature="qr_engine">
      <QrManager />
    </GrowthFeatureGate>
  )
}
