'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { KPICard } from '@/components/design-system/core/KPICard'
import { Card, CardContent } from '@/components/design-system/core/Card'
import { DataCard } from '@/components/design-system/core/DataCard'
import { Button } from '@/components/design-system/core/Button'
import { Input } from '@/components/design-system/core/Input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/design-system/core/Table'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { EmptyState } from '@/components/design-system/core/EmptyState'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useIsMobile } from '@/hooks/use-mobile'
import { PaymentStatus } from './PaymentStatus'
import { formatCurrency } from './constants'
import { apiPost } from '@/src/lib/api'
import { toast } from 'sonner'
import { PdfDocumentActions } from '@/components/pdf/PdfDocumentActions'
import { DocumentHistoryPanel } from '@/components/pdf/DocumentHistoryPanel'
import { Copy, Mail, History, Receipt, CheckCircle2, IndianRupee } from 'lucide-react'

function InvoiceActions({ invoice, onUpdated }) {
  const [partialOpen, setPartialOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const [partialAmount, setPartialAmount] = useState('')
  const [email, setEmail] = useState(invoice.clientEmail || '')

  const invoiceId = String(invoice._id)
  const total = Number(invoice.totalAmount || 0)
  const paid = Number(invoice.amountPaid || 0)
  const due = Math.max(0, total - paid)
  const canPay = invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && due > 0

  const payMutation = useMutation({
    mutationFn: (body) => apiPost(`/invoices/${invoiceId}`, body),
    onSuccess: (data) => {
      toast.success(data.status === 'PAID' ? 'Invoice marked paid' : 'Partial payment recorded')
      setPartialOpen(false)
      setPartialAmount('')
      onUpdated?.()
    },
    onError: (err) => toast.error(err.message || 'Payment update failed'),
  })

  const duplicateMutation = useMutation({
    mutationFn: () => apiPost(`/invoices/${invoiceId}/duplicate`),
    onSuccess: (data) => {
      toast.success(`Duplicate created: ${data.invoice?.invoiceNumber}`)
      onUpdated?.()
    },
    onError: (err) => toast.error(err.message || 'Duplicate failed'),
  })

  const emailMutation = useMutation({
    mutationFn: () => apiPost(`/invoices/${invoiceId}/email`, { email }),
    onSuccess: () => {
      toast.success('Invoice emailed')
      setEmailOpen(false)
    },
    onError: (err) => toast.error(err.message || 'Email failed'),
  })

  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <PdfDocumentActions
        pdfUrl={`/invoices/${invoiceId}`}
        filename={`${invoice.invoiceNumber || 'invoice'}.pdf`}
        shareTitle={`Invoice ${invoice.invoiceNumber}`}
        shareDetails={`${invoice.clientName || ''} · ${formatCurrency(invoice.totalAmount)}`}
      />
      <Button type="button" size="sm" variant="ghost" title="Email PDF" onClick={() => setEmailOpen(true)}>
        <Mail className="size-4" />
      </Button>
      <Button type="button" size="sm" variant="ghost" title="Duplicate" disabled={duplicateMutation.isPending} onClick={() => duplicateMutation.mutate()}>
        <Copy className="size-4" />
      </Button>
      <DocumentHistoryPanel
        docType="invoice"
        docId={invoiceId}
        trigger={<Button type="button" size="sm" variant="ghost" title="History"><History className="size-4" /></Button>}
      />
      {canPay && (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={payMutation.isPending}
            onClick={() => payMutation.mutate({ action: 'pay', amount: due })}
          >
            Mark paid
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={payMutation.isPending}
            onClick={() => {
              setPartialAmount(String(Math.round(due / 2) || ''))
              setPartialOpen(true)
            }}
          >
            Partial
          </Button>
        </>
      )}
      <Dialog open={partialOpen} onOpenChange={setPartialOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record partial payment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {invoice.invoiceNumber} · Due {formatCurrency(due)}
          </p>
          <div>
            <Label>Amount received (₹)</Label>
            <Input
              type="number"
              min="1"
              max={due}
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <Button
            className="w-full"
            disabled={payMutation.isPending || !partialAmount}
            onClick={() => payMutation.mutate({
              action: 'partial_pay',
              amount: Number(partialAmount),
            })}
          >
            Record payment
          </Button>
        </DialogContent>
      </Dialog>
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Email invoice PDF</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
          <div>
            <Label>Recipient email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" placeholder="client@example.com" />
          </div>
          <Button className="w-full" disabled={!email || emailMutation.isPending} onClick={() => emailMutation.mutate()}>
            Send invoice
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function InvoiceList({ invoices = [], isLoading = false, showKpis = true, onUpdated }) {
  const isMobile = useIsMobile()

  if (isLoading) {
    return <LoadingState label="Loading invoices…" rows={5} />
  }

  const totalValue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0)
  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length

  return (
    <div className="space-y-6">
      {showKpis && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          <KPICard
            label="Total invoices"
            value={invoices.length}
            icon={<Receipt className="size-5" />}
          />
          <KPICard
            label="Paid"
            value={paidCount}
            change={invoices.length ? `${Math.round((paidCount / invoices.length) * 100)}% collected` : undefined}
            trend="up"
            icon={<CheckCircle2 className="size-5" />}
          />
          <KPICard
            label="Total value"
            value={formatCurrency(totalValue)}
            icon={<IndianRupee className="size-5" />}
            className="col-span-2 md:col-span-1"
          />
        </div>
      )}

      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-0">
          {!invoices.length ? (
            <EmptyState
              title="No invoices yet"
              description="Invoices created from won proposals will appear here."
              className="m-4 border-0 bg-transparent"
            />
          ) : isMobile ? (
            <div className="space-y-3 p-4">
              {invoices.map((invoice) => (
                <DataCard
                  key={invoice._id || invoice.invoiceNumber}
                  title={invoice.invoiceNumber}
                  subtitle={invoice.clientName || '—'}
                  meta={formatCurrency(invoice.totalAmount)}
                  badges={<PaymentStatus status={invoice.status} type="invoice" />}
                  action={<InvoiceActions invoice={invoice} onUpdated={onUpdated} />}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice._id || invoice.invoiceNumber} className="border-border/30">
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.clientName || '—'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>
                        <PaymentStatus status={invoice.status} type="invoice" />
                        {invoice.amountPaid > 0 && invoice.status !== 'PAID' && (
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            Paid {formatCurrency(invoice.amountPaid)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <InvoiceActions invoice={invoice} onUpdated={onUpdated} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
