export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { getOrgSsoConfig, parseSamlResponse, provisionSsoUser, SSO_PROVIDERS } from '@/lib/auth/sso'
import { issueSsoWebSession } from '@/lib/auth/sso-session'

function appOrigin(request) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
}

export async function POST(request) {
  const origin = appOrigin(request)
  const url = new URL(request.url)
  const orgId = url.searchParams.get('orgId')

  try {
    const form = await request.formData()
    const samlResponse = form.get('SAMLResponse')
    const relayOrgId = form.get('RelayState') || orgId

    if (!relayOrgId || !samlResponse) {
      return NextResponse.redirect(`${origin}/signin?auth_error=saml_missing_response`)
    }

    const db = await getDb()
    const config = await getOrgSsoConfig(db, String(relayOrgId))
    const saml = config.providers?.saml
    if (!saml?.enabled) {
      return NextResponse.redirect(`${origin}/signin?auth_error=sso_disabled`)
    }

    const identity = parseSamlResponse(String(samlResponse), saml)
    const user = await provisionSsoUser(db, String(relayOrgId), {
      email: identity.email,
      fullName: identity.fullName,
      ssoProvider: SSO_PROVIDERS.SAML,
    })

    if (user.status === 'suspended') {
      return NextResponse.redirect(`${origin}/signin?auth_error=account_suspended`)
    }

    const ctx = {
      device: 'web',
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '',
      ua: request.headers.get('user-agent') || '',
    }
    const { exchangeCode } = await issueSsoWebSession(db, user, ctx)
    return NextResponse.redirect(`${origin}/signin/google-complete?code=${exchangeCode}`)
  } catch {
    return NextResponse.redirect(`${origin}/signin?auth_error=saml_assertion_failed`)
  }
}
