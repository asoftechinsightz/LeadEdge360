import { formatBrandCurrency, formatBrandDate } from '@/lib/branding/schema'
import { PdfBuilder } from '@/lib/pdf/layout'

function calcGst(subtotal, discount, gstPercent, gstType) {
  const taxable = Math.max(0, subtotal - discount)
  const gstAmount = (taxable * gstPercent) / 100
  const half = gstAmount / 2
  return {
    taxable,
    gstAmount,
    cgst: gstType === 'IGST' ? 0 : half,
    sgst: gstType === 'IGST' ? 0 : half,
    igst: gstType === 'IGST' ? gstAmount : 0,
    grandTotal: taxable + gstAmount,
  }
}

export async function generateProposalPdf(proposal, branding) {
  const b = branding
  const pdf = new PdfBuilder(b)
  await pdf.init()
  await pdf.drawTenantHeader('Commercial Proposal')

  pdf.section('Proposal Information')
  pdf.drawLine('Proposal Number', proposal.proposalNumber)
  pdf.drawLine('Proposal Date', formatBrandDate(proposal.createdAt, b))
  const validUntil = proposal.validUntil || new Date(new Date(proposal.createdAt || Date.now()).getTime() + 30 * 86400000)
  pdf.drawLine('Valid Until', formatBrandDate(validUntil, b))
  pdf.drawLine('Version', proposal.version || '1.0')

  pdf.section('Prepared For')
  pdf.drawLine('Client Name', proposal.clientName)
  pdf.drawLine('Company', proposal.company)
  pdf.drawLine('Email', proposal.clientEmail)
  pdf.drawLine('Phone', proposal.clientPhone)
  pdf.drawLine('Address', proposal.clientAddress)

  pdf.section('Prepared By')
  pdf.drawLine('Sales Representative', proposal.preparedBy || proposal.assignedTo || '—')

  pdf.section('Proposal Summary')
  pdf.drawLine('Opportunity', proposal.opportunityName || proposal.opportunityId || '—')
  pdf.drawLine('Solution', proposal.solutionName || proposal.product || b.displayName || 'Services')
  if (proposal.description || proposal.message) {
    pdf.drawWrapped(proposal.description || proposal.message, 40, 515, 9)
  }
  pdf.drawLine('Timeline', proposal.expectedTimeline || proposal.timeline || '—')
  pdf.drawLine('Implementation', proposal.implementationDuration || '—')
  pdf.drawLine('Support Period', proposal.supportPeriod || '—')

  const items = proposal.items || []
  pdf.section('Pricing')
  if (items.length) {
    pdf.drawTable(
      ['Item', 'Description', 'Qty', 'Unit', 'Amount'],
      items.map((i) => [
        i.name,
        i.description || i.name,
        String(i.qty ?? 1),
        formatBrandCurrency(i.rate, b),
        formatBrandCurrency(i.amount ?? (i.qty * i.rate), b),
      ]),
      [90, 130, 35, 70, 70],
    )
  }

  const subtotal = Number(proposal.subtotal || items.reduce((s, i) => s + Number(i.amount || 0), 0))
  const discount = Number(proposal.discount || 0)
  const gstPercent = Number(proposal.gstPercent ?? 18)
  const gst = calcGst(subtotal, discount, gstPercent, b.gstType)
  const totals = [
    ['Subtotal', subtotal],
    ...(discount ? [['Discount', -discount]] : []),
    ['Taxable Amount', gst.taxable],
  ]
  if (b.gstType === 'IGST') {
    totals.push([`IGST @ ${gstPercent}%`, gst.igst])
  } else {
    totals.push([`CGST @ ${gstPercent / 2}%`, gst.cgst])
    totals.push([`SGST @ ${gstPercent / 2}%`, gst.sgst])
  }
  totals.push(['Grand Total', proposal.totalAmount || gst.grandTotal])
  pdf.drawTotals(totals)

  pdf.drawTerms(
    b.termsAndConditions?.length
      ? b.termsAndConditions
      : Array.isArray(proposal.terms)
        ? proposal.terms
        : [],
  )
  await pdf.drawBankDetails()
  await pdf.drawPaymentQr()
  await pdf.drawSignatureBlock()

  return pdf.finish(`Proposal ${proposal.proposalNumber}`)
}
