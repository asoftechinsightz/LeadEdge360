'use client'

import { Card, CardContent } from '@/components/design-system/core/Card'
import { DataCard } from '@/components/design-system/core/DataCard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/design-system/core/Table'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { useIsMobile } from '@/hooks/use-mobile'
import { PaymentStatus } from './PaymentStatus'
import { formatCurrency, formatDate } from './constants'

function paymentReference(payment) {
  return payment.razorpay_order_id || payment.id || payment.reference || '—'
}

export function PaymentHistory({ payments = [], isLoading = false }) {
  const isMobile = useIsMobile()

  if (isLoading) {
    return <LoadingState label="Loading payments…" rows={4} />
  }

  if (!payments.length) {
    return (
      <EmptyState
        title="No payment records yet"
        description="Complete a subscription on /subscribe to see payment history here."
      />
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-3">
        {payments.map((payment, index) => (
          <DataCard
            key={payment.id || payment._id || index}
            title={paymentReference(payment)}
            subtitle={payment.plan ? `Plan: ${payment.plan}` : undefined}
            meta={formatCurrency(payment.amount)}
            badges={
              <>
                <PaymentStatus status={payment.status} />
                <span className="text-xs text-muted-foreground">
                  {formatDate(payment.paidAt || payment.createdAt || payment.date)}
                </span>
              </>
            }
          />
        ))}
      </div>
    )
  }

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead>Reference</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment, index) => (
                <TableRow key={payment.id || payment._id || index} className="border-border/30">
                  <TableCell className="font-mono text-xs">{paymentReference(payment)}</TableCell>
                  <TableCell className="capitalize">{payment.plan || '—'}</TableCell>
                  <TableCell className="text-right">
                    {payment.amount != null ? formatCurrency(payment.amount) : '—'}
                  </TableCell>
                  <TableCell>
                    <PaymentStatus status={payment.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(payment.paidAt || payment.createdAt || payment.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
