export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { exchangeGoogleCode } from '@/lib/google-auth'
import {
  getOrgSsoConfig,
  validateGoogleWorkspaceProfile,
  provisionSsoUser,
  SSO_PROVIDERS,
} from '@/lib/auth/sso'
import { issueSsoWebSession } from '@/lib/auth/sso-session'

function appOrigin(request) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
}

export async function GET(request) {
  const origin = appOrigin(request)
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/signin?auth_error=${encodeURIComponent(error)}`)
  }

  const cookieState = request.cookies.get('sso_google_state')?.value
  const orgId = request.cookies.get('sso_google_org')?.value

  if (!code || !orgId) {
    return NextResponse.redirect(`${origin}/signin?auth_error=google_sso_failed`)
  }

  try {
    let stateOrgId = orgId
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'))
        if (parsed.orgId) stateOrgId = parsed.orgId
      } catch {
        // fall back to cookie orgId
      }
    }

    if (cookieState && state) {
      try {
        const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'))
        if (parsed.nonce && parsed.nonce !== cookieState) {
          return NextResponse.redirect(`${origin}/signin?auth_error=invalid_state`)
        }
      } catch {
        // legacy state format
      }
    }

    const redirectUri = `${origin}/api/auth/sso/google/callback`
    const profile = await exchangeGoogleCode(code, redirectUri)

    const db = await getDb()
    const config = await getOrgSsoConfig(db, stateOrgId)
    const workspace = config.providers?.google_workspace
    if (!workspace?.enabled) {
      return NextResponse.redirect(`${origin}/signin?auth_error=sso_disabled`)
    }

    const identity = validateGoogleWorkspaceProfile(profile, workspace)
    const user = await provisionSsoUser(db, stateOrgId, {
      ...identity,
      ssoProvider: SSO_PROVIDERS.GOOGLE_WORKSPACE,
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

    const res = NextResponse.redirect(`${origin}/signin/google-complete?code=${exchangeCode}`)
    res.cookies.delete('sso_google_state')
    res.cookies.delete('sso_google_org')
    return res
  } catch {
    return NextResponse.redirect(`${origin}/signin?auth_error=google_sso_exchange_failed`)
  }
}
