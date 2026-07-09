'use client'

import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { Badge } from '@/components/design-system/core/Badge'
import { LoadingState } from '@/components/design-system/core/LoadingState'

function formatMoney(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

export default function PartnerDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['partner', 'dashboard'],
    queryFn: () => apiGet('/partners/dashboard'),
  })

  const commissionsQuery = useQuery({
    queryKey: ['partner', 'commissions'],
    queryFn: () => apiGet('/partners/commissions'),
  })

  const referralsQuery = useQuery({
    queryKey: ['partner', 'referrals'],
    queryFn: () => apiGet('/partners/referrals').catch(() => ({ items: [] })),
  })

  const stats = dashboardQuery.data || {}
  const commissions = commissionsQuery.data?.items || []
  const referrals = referralsQuery.data?.items || []

  if (dashboardQuery.isLoading) {
    return <LoadingState label="Loading partner dashboard…" className="m-8" />
  }

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Partner Dashboard"
        description="Track referrals, commissions, and payouts"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total commission', value: formatMoney(stats.totalCommission) },
          { label: 'Pending', value: formatMoney(stats.pendingCommission) },
          { label: 'Paid out', value: formatMoney(stats.paidCommission) },
          { label: 'Active partners', value: stats.activePartnerCount ?? 0 },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-card/60">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-bold mt-1">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/60">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">Recent commissions</h2>
            {commissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No commissions yet.</p>
            ) : (
              <ul className="space-y-3">
                {commissions.slice(0, 8).map((row) => (
                  <li key={row.id} className="flex items-center justify-between text-sm">
                    <span>{row.invoiceNumber || row.invoiceId || 'Invoice'}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatMoney(row.commissionAmount)}</span>
                      <Badge variant="outline" className="text-[10px]">{row.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">Referrals</h2>
            {referrals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referrals registered yet.</p>
            ) : (
              <ul className="space-y-3">
                {referrals.slice(0, 8).map((row) => (
                  <li key={row.id} className="flex items-center justify-between text-sm">
                    <span>{row.leadId || row.customerId || row.id}</span>
                    <Badge variant="outline" className="text-[10px]">{row.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
