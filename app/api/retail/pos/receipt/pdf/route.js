export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { guardRetailRequest, retailError } from '@/lib/retail/api-helpers'
import { generateRetailReceiptPdf } from '@/lib/retail/pos/receipt-pdf'
import { sendRetailReceiptWhatsApp } from '@/lib/retail/pos/receipt-whatsapp'

function requestMeta(req) {
  return {
    ip: req.headers.get('x-forwarded-for') || '',
    ua: req.headers.get('user-agent') || '',
  }
}

export async function POST(req) {
  try {
    const { orgId, user } = await guardRetailRequest(req)
    const db = await getDb()
    const body = await req.json()
    const saleId = String(body.saleId || '').trim()
    if (!saleId) {
      return NextResponse.json({ success: false, error: 'saleId is required' }, { status: 400 })
    }

    const language = body.language === 'hi' ? 'hi' : 'en'
    const meta = { ...requestMeta(req), userRole: user.role }

    if (body.sendWhatsApp) {
      const phone = body.phone || body.whatsappNumber
      const result = await sendRetailReceiptWhatsApp(db, orgId, user.id, {
        saleId,
        phone,
        language,
      }, meta)
      return NextResponse.json(result)
    }

    const pdf = await generateRetailReceiptPdf(db, orgId, saleId, language)

    if (body.format === 'base64') {
      return NextResponse.json({
        success: true,
        saleId,
        language,
        pdfBase64: pdf.toString('base64'),
        contentType: 'application/pdf',
      })
    }

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=bill-${saleId.slice(0, 8)}.pdf`,
      },
    })
  } catch (error) {
    return retailError(error)
  }
}
