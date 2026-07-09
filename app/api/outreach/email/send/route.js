export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/send-email'
import { guardCrmRequest, crmError } from '@/lib/crm/api-helpers'

export async function POST(req) {
  try {
    await guardCrmRequest(req)
    const body = await req.json()

    await sendEmail({
      fromName: body.fromName,
      replyTo: body.replyTo,
      to: body.to,
      subject: body.subject,
      html: body.html,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return crmError(error)
  }
}
