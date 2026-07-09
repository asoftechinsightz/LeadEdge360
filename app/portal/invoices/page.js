'use client'

import { useQuery } from '@tanstack/react-query'
import { PortalShell } from '@/components/portal/PortalShell'
import { portalFetch } from '@/lib/portal/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingState } from '@/components/design-system/core/LoadingState'

export default function PortalInvoicesPage() {
  const query = useQuery({
    queryKey: ['portal', 'invoices'],
    queryFn: () => portalFetch('/invoices'),
  })

  const items = query.data?.items || []

  return (
    <PortalShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground">Your billing history</p>
        </div>
        {query.isLoading ? (
          <LoadingState label="Loading invoices…" rows={4} />
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No invoices yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((inv) => (
              <Card key={inv.id || inv._id || inv.invoiceNumber}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{inv.invoiceNumber || inv.number || 'Invoice'}</p>
                    <p className="text-xs text-muted-foreground">{inv.clientName || inv.customerName || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{Number(inv.totalAmount || inv.amount || 0).toLocaleString('en-IN')}</p>
                    <Badge variant="outline" className="text-[10px]">{inv.status || 'DRAFT'}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  )
}
