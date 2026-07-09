export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { getOrgSsoConfig, buildSamlLoginUrl } from '@/lib/auth/sso'

function appOrigin(request) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
}

export async function GET(request) {
  const origin = appOrigin(request)
  const orgId = new URL(request.url).searchParams.get('orgId')
  if (!orgId) {
    return NextResponse.redirect(`${origin}/signin?auth_error=sso_missing_org`)
  }

  try {
    const db = await getDb()
    const config = await getOrgSsoConfig(db, orgId)
    const saml = config.providers?.saml
    if (!saml?.enabled) {
      return NextResponse.redirect(`${origin}/signin?auth_error=sso_disabled`)
    }

    const { url } = buildSamlLoginUrl(saml, { orgId, relayState: orgId })
    return NextResponse.redirect(url)
  } catch {
    return NextResponse.redirect(`${origin}/signin?auth_error=sso_init_failed`)
  }
}
