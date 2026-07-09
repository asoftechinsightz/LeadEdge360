import { formatBrandCurrency, formatBrandDate } from '@/lib/branding/schema'
import { PdfBuilder } from '@/lib/pdf/layout'

function calcInvoiceGst(subtotal, discount, gstPercent, gstType, invoiceGstAmount) {
  const taxable = Math.max(0, subtotal - discount)
  const gstAmount = invoiceGstAmount != null ? Number(invoiceGstAmount) : (taxable * gstPercent) / 100
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

export async function generateInvoicePdf(invoice, branding) {
  const b = branding
  const pdf = new PdfBuilder(b)
  await pdf.init()
  await pdf.drawTenantHeader('TAX INVOICE')

  const gstPercent = Number(invoice.gstPercent ?? 18)
  const subtotal = Number(invoice.subtotal ?? invoice.totalAmount ?? 0)
  const discount = Number(invoice.discount || 0)
  const gst = calcInvoiceGst(subtotal, discount, gstPercent, b.gstType || 'CGST_SGST', invoice.gstAmount)
  const total = Number(invoice.totalAmount ?? gst.grandTotal)
  const paid = Number(invoice.amountPaid || 0)
  const balance = Math.max(0, total - paid)

  pdf.section('Invoice Information')
  pdf.drawLine('Invoice Number', invoice.invoiceNumber)
  pdf.drawLine('Invoice Date', formatBrandDate(invoice.createdAt, b))
  pdf.drawLine('Due Date', formatBrandDate(invoice.dueDate || invoice.createdAt, b))
  pdf.drawLine('Place of Supply', invoice.placeOfSupply || b.placeOfSupply || b.state || '—')
  pdf.drawLine('GST Type', b.gstType === 'IGST' ? 'IGST' : 'CGST + SGST')
  pdf.drawLine('Status', invoice.status || 'PENDING')

  pdf.section('Customer Details')
  pdf.drawLine('Client Name', invoice.clientName)
  pdf.drawLine('Company', invoice.company)
  pdf.drawLine('Customer GSTIN', invoice.clientGstin || '—')
  pdf.drawLine('Billing Address', invoice.billingAddress || invoice.clientAddress || '—')
  pdf.drawLine('Shipping Address', invoice.shippingAddress || invoice.billingAddress || '—')
  pdf.drawLine('Email', invoice.clientEmail)
  pdf.drawLine('Phone', invoice.clientPhone)

  const items = invoice.items?.length
    ? invoice.items
    : [{ name: invoice.product || 'Services', qty: 1, rate: subtotal, gst: gstPercent, amount: subtotal }]

  pdf.section('Invoice Items')
  pdf.drawTable(
    ['Item', 'Qty', 'Rate', 'GST%', 'Amount'],
    items.map((i) => [
      i.name,
      String(i.qty ?? 1),
      formatBrandCurrency(i.rate, b),
      `${i.gst ?? gstPercent}%`,
      formatBrandCurrency(i.amount ?? i.rate, b),
    ]),
    [150, 40, 80, 45, 80],
  )

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
  totals.push(['Grand Total', total])
  if (paid > 0) totals.push(['Amount Received', paid])
  if (balance > 0) totals.push(['Balance Due', balance])
  pdf.drawTotals(totals)

  pdf.section('Payment Details')
  if (b.bankName) pdf.drawLine('Bank', b.bankName)
  if (b.bankAccountNumber) pdf.drawLine('Account Number', b.bankAccountNumber)
  if (b.bankIfsc) pdf.drawLine('IFSC', b.bankIfsc)
  if (b.upiId) pdf.drawLine('UPI ID', b.upiId)
  if (b.paymentLink) pdf.drawLine('Payment Link', b.paymentLink)
  await pdf.drawPaymentQr()

  if (b.invoiceNotes || b.latePaymentPolicy) {
    pdf.section('Notes')
    if (b.invoiceNotes) pdf.drawWrapped(b.invoiceNotes, 40, 515, 9)
    if (b.latePaymentPolicy) pdf.drawWrapped(b.latePaymentPolicy, 40, 515, 8)
  } else {
    pdf.drawWrapped('Thank you for your business.', 40, 515, 9)
  }

  await pdf.drawSignatureBlock()
  return pdf.finish(`Invoice ${invoice.invoiceNumber}`)
}
