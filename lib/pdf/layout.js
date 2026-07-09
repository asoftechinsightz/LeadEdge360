import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { PLATFORM_FOOTER, formatBrandCurrency, formatBrandDate } from '@/lib/branding/schema'

const PAGE_W = 595
const PAGE_H = 842
const MARGIN = 40
const FOOTER_H = 36

function hexToRgb(hex) {
  const h = String(hex || '#0A1F44').replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

async function embedDataUrl(pdfDoc, dataUrl) {
  if (!dataUrl || !String(dataUrl).startsWith('data:image')) return null
  try {
    const b64 = String(dataUrl).split(',')[1]
    const bytes = Buffer.from(b64, 'base64')
    if (dataUrl.includes('image/png')) return pdfDoc.embedPng(bytes)
    if (dataUrl.includes('image/jpeg') || dataUrl.includes('image/jpg')) return pdfDoc.embedJpg(bytes)
  } catch {
    return null
  }
  return null
}

async function fetchQrPng(data) {
  if (!data) return null
  try {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(data)}`
    const res = await fetch(url)
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer())
  } catch {
    return null
  }
}

export class PdfBuilder {
  constructor(branding) {
    this.branding = branding
    this.pdfDoc = null
    this.font = null
    this.fontBold = null
    this.page = null
    this.y = 0
    this.pageCount = 0
    this.primary = hexToRgb(branding.primaryColor)
    this.accent = hexToRgb(branding.secondaryColor)
  }

  async init() {
    this.pdfDoc = await PDFDocument.create()
    this.font = await this.pdfDoc.embedFont(StandardFonts.Helvetica)
    this.fontBold = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold)
    this.addPage()
  }

  addPage() {
    this.page = this.pdfDoc.addPage([PAGE_W, PAGE_H])
    this.pageCount += 1
    this.y = PAGE_H - MARGIN
    return this.page
  }

  ensureSpace(needed = 60) {
    if (this.y - needed < MARGIN + FOOTER_H) {
      this.drawPageFooter()
      this.addPage()
    }
  }

  drawWrapped(text, x, maxWidth, size = 10, bold = false, color = rgb(0, 0, 0)) {
    const font = bold ? this.fontBold : this.font
    const words = String(text || '—').split(/\s+/)
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
        this.ensureSpace(14)
        this.page.drawText(line, { x, y: this.y, size, font, color })
        this.y -= size + 4
        line = word
      } else {
        line = test
      }
    }
    if (line) {
      this.ensureSpace(14)
      this.page.drawText(line, { x, y: this.y, size, font, color })
      this.y -= size + 4
    }
  }

  drawLine(label, value, size = 10) {
    this.ensureSpace(16)
    this.page.drawText(`${label}:`, { x: MARGIN, y: this.y, size, font: this.fontBold })
    this.page.drawText(String(value || '—'), { x: MARGIN + 130, y: this.y, size, font: this.font })
    this.y -= size + 6
  }

  section(title) {
    this.ensureSpace(28)
    this.y -= 8
    this.page.drawText(title, { x: MARGIN, y: this.y, size: 12, font: this.fontBold, color: this.primary })
    this.y -= 18
    this.page.drawLine({
      start: { x: MARGIN, y: this.y + 10 },
      end: { x: PAGE_W - MARGIN, y: this.y + 10 },
      thickness: 0.5,
      color: this.accent,
    })
    this.y -= 6
  }

  async drawTenantHeader(docTitle) {
    const b = this.branding
    this.page.drawRectangle({ x: 0, y: PAGE_H - 72, width: PAGE_W, height: 72, color: this.primary })
    const logo = await embedDataUrl(this.pdfDoc, b.logoDataUrl)
    if (logo) {
      const w = 100
      const h = Math.min(32, (logo.height / logo.width) * w)
      this.page.drawImage(logo, { x: MARGIN, y: PAGE_H - 58, width: w, height: h })
    } else if (b.displayName) {
      this.page.drawText(b.displayName, {
        x: MARGIN, y: PAGE_H - 44, size: 14, font: this.fontBold, color: rgb(1, 1, 1),
      })
    }
    this.page.drawText(docTitle, {
      x: PAGE_W - MARGIN - 140,
      y: PAGE_H - 44,
      size: 13,
      font: this.fontBold,
      color: this.accent,
    })
    this.y = PAGE_H - 88

    if (b.tagline) {
      this.drawWrapped(b.tagline, MARGIN, PAGE_W - 80, 9, false, rgb(0.35, 0.35, 0.35))
    }
    if (b.fullAddress) {
      this.drawWrapped(b.fullAddress.replace(/\n/g, ', '), MARGIN, PAGE_W - 80, 8)
    }
    const contact = [
      b.gstin ? `GSTIN: ${b.gstin}` : null,
      b.pan ? `PAN: ${b.pan}` : null,
      b.cin ? `CIN: ${b.cin}` : null,
      b.phone ? `Phone: ${b.phone}` : null,
      b.supportEmail ? `Email: ${b.supportEmail}` : null,
      b.website ? `Web: ${b.website}` : null,
    ].filter(Boolean).join('  |  ')
    if (contact) this.drawWrapped(contact, MARGIN, PAGE_W - 80, 8)
    this.y -= 10
  }

  drawTable(headers, rows, colWidths) {
    const startX = MARGIN
    const rowH = 18
    this.ensureSpace(rowH * (rows.length + 2))
    let x = startX
    headers.forEach((h, i) => {
      this.page.drawText(h, { x, y: this.y, size: 9, font: this.fontBold })
      x += colWidths[i]
    })
    this.y -= rowH
    this.page.drawLine({
      start: { x: startX, y: this.y + 12 },
      end: { x: PAGE_W - MARGIN, y: this.y + 12 },
      thickness: 0.5,
    })
    for (const row of rows) {
      this.ensureSpace(rowH)
      x = startX
      row.forEach((cell, i) => {
        const text = String(cell ?? '').slice(0, 28)
        this.page.drawText(text, { x, y: this.y, size: 8, font: this.font })
        x += colWidths[i]
      })
      this.y -= rowH
    }
    this.y -= 8
  }

  drawTotals(lines) {
    const b = this.branding
    this.ensureSpace(lines.length * 16 + 20)
    const x = PAGE_W - MARGIN - 200
    for (const [label, amount] of lines) {
      this.page.drawText(label, { x, y: this.y, size: 9, font: this.font })
      this.page.drawText(formatBrandCurrency(amount, b), { x: x + 110, y: this.y, size: 9, font: this.font })
      this.y -= 14
    }
    this.y -= 6
  }

  drawTerms(terms = []) {
    if (!terms.length) return
    this.section('Terms & Conditions')
    for (const t of terms) {
      this.drawWrapped(`• ${t}`, MARGIN, PAGE_W - 80, 8)
    }
  }

  drawBankDetails() {
    const b = this.branding
    if (!b.bankName && !b.upiId) return
    this.section('Bank Details')
    if (b.bankAccountName) this.drawLine('Account Name', b.bankAccountName)
    if (b.bankName) this.drawLine('Bank', b.bankName)
    if (b.bankAccountNumber) this.drawLine('Account No', b.bankAccountNumber)
    if (b.bankIfsc) this.drawLine('IFSC', b.bankIfsc)
    if (b.bankBranch) this.drawLine('Branch', b.bankBranch)
    if (b.upiId) this.drawLine('UPI ID', b.upiId)
    if (b.paymentLink) this.drawLine('Payment Link', b.paymentLink)
  }

  async drawSignatureBlock() {
    const b = this.branding
    this.ensureSpace(100)
    const sig = await embedDataUrl(this.pdfDoc, b.signatureDataUrl)
    const stamp = await embedDataUrl(this.pdfDoc, b.stampDataUrl)

    if (stamp) {
      this.page.drawImage(stamp, { x: MARGIN + 180, y: this.y - 48, width: 64, height: 64 })
    }

    if (sig) {
      this.page.drawImage(sig, { x: MARGIN, y: this.y - 40, width: 100, height: 36 })
      this.y -= 48
    } else {
      this.page.drawLine({ start: { x: MARGIN, y: this.y - 20 }, end: { x: MARGIN + 160, y: this.y - 20 }, thickness: 0.5 })
      this.y -= 28
    }
    if (b.authorizedSignatory) {
      this.page.drawText(b.authorizedSignatory, { x: MARGIN, y: this.y, size: 9, font: this.fontBold })
      this.y -= 12
    }
    if (b.signatoryTitle) {
      this.page.drawText(b.signatoryTitle, { x: MARGIN, y: this.y, size: 8, font: this.font })
      this.y -= 12
    }
    this.page.drawText('Authorized Signatory', { x: MARGIN, y: this.y, size: 8, font: this.font, color: rgb(0.4, 0.4, 0.4) })
    this.y -= 20
  }

  async drawPaymentQr() {
    const b = this.branding
    const qrData = b.paymentLink || b.upiId
    if (!qrData) return
    const png = await fetchQrPng(qrData)
    if (!png) return
    this.ensureSpace(150)
    const img = await this.pdfDoc.embedPng(png)
    this.page.drawImage(img, { x: PAGE_W - MARGIN - 100, y: this.y - 100, width: 90, height: 90 })
    this.page.drawText('Scan to pay', { x: PAGE_W - MARGIN - 95, y: this.y - 108, size: 8, font: this.font })
  }

  drawPageFooter(extra = '') {
    const b = this.branding
    const generated = formatBrandDate(new Date(), b)
    this.page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: FOOTER_H, color: this.primary })
    this.page.drawText(`Thank you · ${PLATFORM_FOOTER}`, {
      x: MARGIN, y: 14, size: 7, font: this.font, color: rgb(1, 1, 1),
    })
    const right = `Generated ${generated}${extra ? ` · ${extra}` : ''} · Page ${this.pageCount}`
    this.page.drawText(right, {
      x: PAGE_W - MARGIN - this.font.widthOfTextAtSize(right, 7),
      y: 14,
      size: 7,
      font: this.font,
      color: rgb(1, 1, 1),
    })
  }

  async finish(meta = '') {
    this.drawPageFooter(meta)
    return Buffer.from(await this.pdfDoc.save())
  }
}

export { embedDataUrl, fetchQrPng, formatBrandCurrency, formatBrandDate, PLATFORM_FOOTER }
