'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/src/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { ProposalTable } from '@/components/suite/ProposalTable'
import { ProposalCreateDialog } from '@/components/suite/CreateEntityDialogs'

export default function ProposalsPage() {
  const searchParams = useSearchParams()
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    if (searchParams?.get('new') === '1') setCreateOpen(true)
  }, [searchParams])
  const proposalsQuery = useQuery({
    queryKey: ['proposals'],
    queryFn: () => apiGet('/proposals'),
  })
  const proposals = proposalsQuery.data?.proposals || []

  const totalValue = proposals.reduce((a, b) => a + Number(b.totalAmount || 0), 0)

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold mb-6">Proposal Management</h1>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div>Total</div>
            <div className="text-3xl font-bold">{proposals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>Accepted</div>
            <div className="text-3xl font-bold">{proposals.filter((p) => p.status === 'ACCEPTED').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>Draft</div>
            <div className="text-3xl font-bold">{proposals.filter((p) => p.status === 'DRAFT').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>Value</div>
            <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <ProposalTable proposals={proposals} />
        </CardContent>
      </Card>

      <ProposalCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => proposalsQuery.refetch()}
      />
    </div>
  )
}
