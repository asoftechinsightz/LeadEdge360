export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { findOrgByEmailDomain, SSO_PROVIDERS } from '@/lib/auth/sso'

/** Public — discover SSO options for an email domain. */
export async function GET(req) {
  const email = new URL(req.url).searchParams.get('email') || ''
  const domain = email.includes('@') ? email.split('@')[1]?.toLowerCase() : email.toLowerCase()

  if (!domain) {
    return NextResponse.json({ success: true, sso: null })
  }

  try {
    const db = await getDb()
    const match = await findOrgByEmailDomain(db, domain)
    if (!match) {
      return NextResponse.json({ success: true, sso: null })
    }

    return NextResponse.json({
      success: true,
      sso: {
        orgId: match.orgId,
        orgName: match.org?.name || 'Your organization',
        provider: match.provider,
        saml: match.provider === SSO_PROVIDERS.SAML,
        googleWorkspace: match.provider === SSO_PROVIDERS.GOOGLE_WORKSPACE,
        loginUrl: match.provider === SSO_PROVIDERS.SAML
          ? `/api/auth/sso/saml/login?orgId=${match.orgId}`
          : `/api/auth/sso/google/login?orgId=${match.orgId}`,
      },
    })
  } catch {
    return NextResponse.json({ success: true, sso: null })
  }
}
