'use client'

import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PdfDocumentActions } from '@/components/pdf/PdfDocumentActions'

export function ProposalTable({ proposals = [] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Proposal</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {proposals.map((p) => (
          <TableRow key={p._id}>
            <TableCell>
              <Link href={`/proposals/${p._id}`} className="font-medium hover:text-primary">
                {p.proposalNumber}
              </Link>
            </TableCell>
            <TableCell>{p.clientName}</TableCell>
            <TableCell>₹{p.totalAmount}</TableCell>
            <TableCell>
              <Badge>{p.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <PdfDocumentActions
                  pdfUrl={`/proposals/${p._id}/pdf`}
                  filename={`${p.proposalNumber || 'proposal'}.pdf`}
                  shareTitle={`Proposal ${p.proposalNumber}`}
                  shareDetails={`${p.clientName} · ₹${p.totalAmount}`}
                />
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/proposals/${p._id}`}>View</Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {proposals.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
              No proposals yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
