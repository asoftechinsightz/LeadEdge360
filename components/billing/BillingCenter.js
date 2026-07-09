'use client'

import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { KPICard } from '@/components/design-system/core/KPICard'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/design-system/core/Tabs'
import { SubscriptionPanel } from './SubscriptionPanel'
import { InvoiceList } from './InvoiceList'
import { PaymentHistory } from './PaymentHistory'
import { formatCurrency } from './constants'
import { IndianRupee, Receipt, CreditCard } from 'lucide-react'

export function BillingCenter() {
  const subscriptionQuery = useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => apiGet('/users/subscription'),
  })

  const revenueQuery = useQuery({
    queryKey: ['billing', 'revenue-dashboard'],
    queryFn: () => apiGet('/revenue/dashboard'),
    retry: false,
  })

  const invoicesQuery = useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => apiGet('/invoices'),
    retry: false,
  })

  const paymentsQuery = useQuery({
    queryKey: ['billing', 'payments'],
    queryFn: () => apiGet('/payments'),
  })

  const loading = subscriptionQuery.isLoading

  const revenue = revenueQuery.data
  const invoices = invoicesQuery.data?.invoices || []
  const payments = paymentsQuery.data?.payments || []

  if (loading) {
    return (
      <div className="container py-10">
        <PageHeader title="Billing Center" description="Plans, subscription, invoices, and payments" />
        <LoadingState label="Loading billing center…" rows={6} />
      </div>
    )
  }

  return (
    <div className="container py-10 space-y-8">
      <PageHeader
        title="Billing Center"
        description="Manage your subscription, view invoices, and track payment history."
      />

      <SubscriptionPanel
        subscription={subscriptionQuery.data}
        isLoading={subscriptionQuery.isLoading}
      />

      {revenue && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Total revenue"
            value={formatCurrency(revenue.totalRevenue)}
            icon={<IndianRupee className="size-5" />}
          />
          <KPICard
            label="Collected"
            value={formatCurrency(revenue.paidRevenue)}
            change={revenue.pendingRevenue ? `${formatCurrency(revenue.pendingRevenue)} pending` : undefined}
            trend="up"
            icon={<CreditCard className="size-5" />}
          />
          <KPICard
            label="Invoices"
            value={revenue.invoiceCount ?? invoices.length}
            icon={<Receipt className="size-5" />}
          />
          <KPICard
            label="Payments"
            value={revenue.paymentCount ?? payments.length}
            icon={<CreditCard className="size-5" />}
          />
        </div>
      )}

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <InvoiceList
            invoices={invoices}
            isLoading={invoicesQuery.isLoading}
            showKpis={false}
          />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentHistory
            payments={payments}
            isLoading={paymentsQuery.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
