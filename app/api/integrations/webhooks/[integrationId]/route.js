export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { verifyIntegrationWebhook } from '@/lib/integrations/service'

export async function POST(req, { params }) {
  const integrationId = params.integrationId
  const url = new URL(req.url)
  const orgId = url.searchParams.get('orgId')
  if (!orgId) {
    return NextResponse.json({ success: false, error: 'ORG_ID_REQUIRED' }, { status: 400 })
  }

  const rawBody = await req.text()
  const verification = await verifyIntegrationWebhook(integrationId, orgId, rawBody, req.headers)

  if (!verification.ok) {
    return NextResponse.json({ success: false, error: 'WEBHOOK_VERIFICATION_FAILED', reason: verification.reason }, { status: 401 })
  }

  let payload = {}
  try {
    payload = rawBody ? JSON.parse(rawBody) : {}
  } catch {
    payload = { raw: rawBody.slice(0, 500) }
  }

  return NextResponse.json({
    success: true,
    received: true,
    integrationId,
    orgId,
    eventType: payload.event || payload.object || 'unknown',
  })
}

export async function GET(req, { params }) {
  const integrationId = params.integrationId
  const url = new URL(req.url)
  const mode = url.searchParams.get('hub.mode')
  const challenge = url.searchParams.get('hub.challenge')
  const verifyToken = url.searchParams.get('hub.verify_token')
  const orgId = url.searchParams.get('orgId')

  if (integrationId === 'whatsapp' && mode === 'subscribe' && challenge) {
    const { getOrgIntegrationCredentials } = await import('@/lib/integrations/service')
    const creds = orgId ? await getOrgIntegrationCredentials(orgId, 'whatsapp') : null
    const expected = creds?.credentials?.verifyToken || process.env.WHATSAPP_VERIFY_TOKEN
    if (expected && verifyToken === expected) {
      return new NextResponse(challenge, { status: 200 })
    }
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  return NextResponse.json({ ok: true, integrationId: params.integrationId })
}
