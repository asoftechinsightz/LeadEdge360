export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getDb } from '@/lib/mongo'
import { getOrgSsoConfig, buildGoogleWorkspaceSsoUrl } from '@/lib/auth/sso'

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
    const workspace = config.providers?.google_workspace
    if (!workspace?.enabled) {
      return NextResponse.redirect(`${origin}/signin?auth_error=sso_disabled`)
    }

    const state = crypto.randomBytes(16).toString('hex')
    const loginUrl = buildGoogleWorkspaceSsoUrl(workspace, { orgId, state })

    const res = NextResponse.redirect(loginUrl)
    res.cookies.set('sso_google_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    res.cookies.set('sso_google_org', orgId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.redirect(`${origin}/signin?auth_error=sso_init_failed`)
  }
}
