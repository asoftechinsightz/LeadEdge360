'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/src/lib/api'
import { PageHeader } from '@/components/design-system/core/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { PdfDocumentActions } from '@/components/pdf/PdfDocumentActions'
import { DocumentHistoryPanel } from '@/components/pdf/DocumentHistoryPanel'
import { ArrowLeft, Copy, FileText, Mail, Receipt, Trophy } from 'lucide-react'

export default function ProposalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const proposalId = params?.id
  const [email, setEmail] = useState('')

  const proposalsQuery = useQuery({
    queryKey: ['proposals'],
    queryFn: () => apiGet('/proposals'),
  })

  const proposal = useMemo(() => {
    const list = proposalsQuery.data?.proposals || []
    return list.find((p) => String(p._id) === String(proposalId))
  }, [proposalsQuery.data, proposalId])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['proposals'] })

  const emailMutation = useMutation({
    mutationFn: () => apiPost(`/proposals/${proposalId}/email`, { email }),
    onSuccess: () => toast.success('Proposal emailed'),
    onError: (err) => toast.error(err.message || 'Email failed'),
  })

  const wonMutation = useMutation({
    mutationFn: () => apiPost(`/proposals/${proposalId}/won`),
    onSuccess: () => {
      toast.success('Marked as won')
      invalidate()
    },
    onError: (err) => toast.error(err.message || 'Failed'),
  })

  const invoiceMutation = useMutation({
    mutationFn: () => apiPost(`/proposals/${proposalId}/convert-to-invoice`),
    onSuccess: (data) => {
      toast.success(`Invoice ${data.invoiceNumber} created`)
      router.push('/invoices')
    },
    onError: (err) => toast.error(err.message || 'Conversion failed'),
  })

  const duplicateMutation = useMutation({
    mutationFn: () => apiPost(`/proposals/${proposalId}/duplicate`),
    onSuccess: (data) => {
      toast.success(`Duplicate created: ${data.proposal?.proposalNumber}`)
      router.push(`/proposals/${data.proposal?._id || data.proposal?.id}`)
    },
    onError: (err) => toast.error(err.message || 'Duplicate failed'),
  })

  if (proposalsQuery.isLoading) {
    return <div className="container py-10 text-muted-foreground">Loading proposal…</div>
  }

  if (!proposal) {
    return (
      <div className="container py-10">
        <p className="text-muted-foreground">Proposal not found.</p>
        <Button asChild variant="link" className="mt-2 px-0">
          <Link href="/proposals">Back to proposals</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/proposals">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to proposals
        </Link>
      </Button>

      <PageHeader
        title={proposal.proposalNumber || 'Proposal'}
        description={proposal.clientName || proposal.company}
        actions={<Badge>{proposal.status}</Badge>}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/60">
          <CardContent className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground text-xs block">Client</span>{proposal.clientName}</div>
              <div><span className="text-muted-foreground text-xs block">Company</span>{proposal.company || '—'}</div>
              <div><span className="text-muted-foreground text-xs block">Subtotal</span>₹{Number(proposal.subtotal || 0).toLocaleString()}</div>
              <div><span className="text-muted-foreground text-xs block">GST</span>{proposal.gstPercent}% (₹{Number(proposal.gstAmount || 0).toLocaleString()})</div>
              <div><span className="text-muted-foreground text-xs block">Total</span><span className="text-xl font-bold">₹{Number(proposal.totalAmount || 0).toLocaleString()}</span></div>
              <div><span className="text-muted-foreground text-xs block">Version</span>{proposal.version || '1.0'}</div>
              <div><span className="text-muted-foreground text-xs block">Created</span>{proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString() : '—'}</div>
            </div>
            {proposal.notes && (
              <div>
                <span className="text-muted-foreground text-xs block mb-1">Notes</span>
                <p className="text-sm">{proposal.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Actions</h3>
            <PdfDocumentActions
              pdfUrl={`/proposals/${proposalId}/pdf`}
              filename={`${proposal.proposalNumber || 'proposal'}.pdf`}
              shareTitle={`Proposal ${proposal.proposalNumber}`}
              shareDetails={`${proposal.clientName} · ₹${proposal.totalAmount}`}
              variant="outline"
            />
            <div className="space-y-2">
              <Label>Email to</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="client@example.com" />
              <Button className="w-full" disabled={!email || emailMutation.isPending} onClick={() => emailMutation.mutate()}>
                <Mail className="h-4 w-4 mr-2" /> Send email
              </Button>
            </div>
            <Button className="w-full justify-start" variant="outline" disabled={duplicateMutation.isPending} onClick={() => duplicateMutation.mutate()}>
              <Copy className="h-4 w-4 mr-2" /> Duplicate proposal
            </Button>
            <DocumentHistoryPanel docType="proposal" docId={proposalId} trigger={
              <Button className="w-full justify-start" variant="outline" type="button">
                <FileText className="h-4 w-4 mr-2" /> Version history
              </Button>
            } />
            <Button className="w-full justify-start" variant="outline" disabled={wonMutation.isPending} onClick={() => wonMutation.mutate()}>
              <Trophy className="h-4 w-4 mr-2" /> Mark as won
            </Button>
            <Button className="w-full justify-start" disabled={invoiceMutation.isPending} onClick={() => invoiceMutation.mutate()}>
              <Receipt className="h-4 w-4 mr-2" /> Convert to invoice
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
