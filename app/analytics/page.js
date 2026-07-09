'use client'

import { PageHeader } from '@/components/design-system/core/PageHeader'
import { AnalyticsDashboard } from '@/components/suite/AnalyticsDashboard'
import { Attribution } from '@/components/analytics/Attribution'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/design-system/core/Tabs'

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Lead funnel, sources, campaigns, revenue trends, and ad attribution."
      />
      <Tabs defaultValue="overview">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attribution">Attribution &amp; ROAS</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <AnalyticsDashboard />
        </TabsContent>
        <TabsContent value="attribution">
          <Attribution />
        </TabsContent>
      </Tabs>
    </div>
  )
}
