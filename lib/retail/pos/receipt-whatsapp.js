import { sendWhatsAppDocument, uploadWhatsAppMedia } from '@/lib/whatsapp'
import { sendMessage } from '@/lib/whatsapp/service'
import { generateRetailReceiptPdf } from '@/lib/retail/pos/receipt-pdf'
import { receiptLabels } from '@/lib/retail/pos/receipt-labels'

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`
  return digits
}

/**
 * Generate GST receipt PDF and send on WhatsApp (document message).
 */
export async function sendRetailReceiptWhatsApp(db, orgId, userId, { saleId, phone, language = 'en' }, meta = {}) {
  const to = normalizePhone(phone)
  if (!to) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'phone is required'
    throw err
  }

  const pdfBuffer = await generateRetailReceiptPdf(db, orgId, saleId, language)
  const labels = receiptLabels(language)
  const caption = language === 'hi'
    ? `${labels.title} — ${saleId}`
    : `${labels.title} — ${saleId}`

  const upload = await uploadWhatsAppMedia(pdfBuffer, `bill-${saleId.slice(0, 8)}.pdf`)
  let waResult = { ok: false, stored: true, reason: 'whatsapp-not-configured' }

  if (upload.ok && upload.mediaId) {
    waResult = await sendWhatsAppDocument({
      to,
      mediaId: upload.mediaId,
      filename: `bill-${saleId.slice(0, 8)}.pdf`,
      caption,
    })
  }

  await sendMessage(db, orgId, userId, '', {
    contactPhone: to,
    text: caption,
  }, meta).catch(() => null)

  return {
    success: true,
    whatsapp: waResult,
    pdfSize: pdfBuffer.length,
  }
}
