'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { InvoiceList } from '@/components/billing'

export default function InvoicesPage() {
  const queryClient = useQueryClient()
  const invoicesQuery = useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: () => apiGet('/invoices'),
  })

  const invoices = invoicesQuery.data?.invoices || []

  return (
    <div className="space-y-8">
      <PageHeader
        title="Invoice Management"
        description="View issued invoices, record payments, and download GST-compliant PDFs."
      />
      <InvoiceList
        invoices={invoices}
        isLoading={invoicesQuery.isLoading}
        onUpdated={() => queryClient.invalidateQueries({ queryKey: ['billing', 'invoices'] })}
      />
    </div>
  )
}
