import { NextResponse } from 'next/server'
import { getSmtpReadiness, verifySmtpConnection } from '@/lib/campaigns/smtp'

export async function GET() {
  try {
    const readiness = getSmtpReadiness()
    const verify = readiness.ready ? await verifySmtpConnection() : readiness
    return NextResponse.json({ success: true, ...verify })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
