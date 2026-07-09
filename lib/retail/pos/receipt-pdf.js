import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { getOrgBranding } from '@/lib/branding/service'
import { formatInr, receiptLabels } from '@/lib/retail/pos/receipt-labels'

const PAGE_W = 595
const PAGE_H = 842
const MARGIN = 40

let devanagariFontBytes = null

async function loadDevanagariFont() {
  if (devanagariFontBytes) return devanagariFontBytes
  const url = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hindufonts/NotoSansDevanagari/hinted/ttf/NotoSansDevanagari-Regular.ttf'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to load Hindi font for PDF')
  devanagariFontBytes = new Uint8Array(await res.arrayBuffer())
  return devanagariFontBytes
}

async function embedFont(pdfDoc, language) {
  if (language === 'hi') {
    try {
      const bytes = await loadDevanagariFont()
      return pdfDoc.embedFont(bytes, { subset: true })
    } catch {
      return pdfDoc.embedFont(StandardFonts.Helvetica)
    }
  }
  return pdfDoc.embedFont(StandardFonts.Helvetica)
}

function drawText(page, font, text, x, y, size = 10, color = rgb(0, 0, 0)) {
  page.drawText(String(text ?? '—'), { x, y, size, font, color })
}

export async function loadSaleForReceipt(db, orgId, saleId) {
  const sale = await db.collection('retail_sales').findOne({ orgId, id: saleId }, { projection: { _id: 0 } })
  if (!sale) {
    const err = new Error('NOT_FOUND')
    err.detail = 'Sale not found'
    throw err
  }
  return sale
}

export async function generateRetailReceiptPdf(db, orgId, saleId, language = 'en') {
  const sale = await loadSaleForReceipt(db, orgId, saleId)
  const branding = await getOrgBranding(db, orgId)
  const org = await db.collection('orgs').findOne({ id: orgId }, { projection: { _id: 0, name: 1, gstin: 1, phone: 1, city: 1 } })
  const labels = receiptLabels(language)

  const pdfDoc = await PDFDocument.create()
  const font = await embedFont(pdfDoc, language)
  const fontBold = language === 'hi' ? font : await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const page = pdfDoc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN

  const shopName = branding.companyName || org?.name || 'RetailEdge360'
  const gstin = branding.gstin || org?.gstin || '—'
  const subtotal = Number(sale.subtotal ?? sale.totalAmount ?? 0)
  const cgst = Number(sale.cgst ?? 0)
  const sgst = Number(sale.sgst ?? 0)
  const gstRate = Number(sale.gstRate ?? 5)
  const total = Number(sale.totalAmount ?? subtotal + cgst + sgst)
  const halfRate = gstRate / 2
  const dateStr = sale.createdAt ? String(sale.createdAt).substring(0, 10) : '—'

  page.drawRectangle({ x: 0, y: PAGE_H - 64, width: PAGE_W, height: 64, color: rgb(0.95, 0.45, 0.1) })
  drawText(page, fontBold, shopName, MARGIN, PAGE_H - 36, 14, rgb(1, 1, 1))
  drawText(page, font, labels.title, PAGE_W - MARGIN - 120, PAGE_H - 36, 12, rgb(1, 1, 1))
  y = PAGE_H - 80

  drawText(page, fontBold, `${labels.gstin}:`, MARGIN, y, 9)
  drawText(page, font, gstin, MARGIN + 50, y, 9)
  y -= 16
  drawText(page, fontBold, `${labels.billNo}:`, MARGIN, y, 9)
  drawText(page, font, sale.id, MARGIN + 50, y, 9)
  drawText(page, fontBold, `${labels.date}:`, MARGIN + 280, y, 9)
  drawText(page, font, dateStr, MARGIN + 330, y, 9)
  y -= 24

  drawText(page, fontBold, labels.item, MARGIN, y, 9)
  drawText(page, fontBold, labels.qty, MARGIN + 240, y, 9)
  drawText(page, fontBold, labels.rate, MARGIN + 290, y, 9)
  drawText(page, fontBold, labels.amount, MARGIN + 380, y, 9)
  y -= 12
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5 })
  y -= 14

  const items = Array.isArray(sale.items) ? sale.items : []
  for (const line of items) {
    const name = String(line.name || line.sku || 'Item').slice(0, 32)
    const qty = String(line.qty ?? 1)
    const rate = formatInr(line.unitPrice ?? 0)
    const amount = formatInr(line.amount ?? (line.unitPrice || 0) * (line.qty || 1))
    drawText(page, font, name, MARGIN, y, 8)
    drawText(page, font, qty, MARGIN + 245, y, 8)
    drawText(page, font, rate, MARGIN + 290, y, 8)
    drawText(page, font, amount, MARGIN + 380, y, 8)
    y -= 14
  }

  y -= 10
  page.drawLine({ start: { x: MARGIN, y: y + 8 }, end: { x: PAGE_W - MARGIN, y: y + 8 }, thickness: 0.5 })
  y -= 8

  const totalsX = PAGE_W - MARGIN - 180
  const drawTotal = (label, value) => {
    y -= 14
    drawText(page, font, label, totalsX, y, 9)
    drawText(page, font, formatInr(value), totalsX + 100, y, 9)
  }

  drawTotal(labels.subtotal, subtotal)
  drawTotal(labels.cgstAt(halfRate), cgst)
  drawTotal(labels.sgstAt(halfRate), sgst)
  y -= 6
  drawText(page, fontBold, labels.total, totalsX, y, 11)
  drawText(page, fontBold, formatInr(total), totalsX + 100, y, 11, rgb(0.95, 0.45, 0.1))
  y -= 20
  drawText(page, font, `${labels.payment}: ${sale.paymentMethod || 'cash'}`, MARGIN, y, 9)
  y -= 24
  drawText(page, font, labels.thankYou, MARGIN, y, 10, rgb(0.3, 0.3, 0.3))

  return Buffer.from(await pdfDoc.save())
}
