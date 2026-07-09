import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { buildMicrosoftLoginUrl, isMicrosoftLoginConfigured } from '@/lib/microsoft-auth'

function appOrigin(request) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
}

/** GET — redirect browser to Microsoft OAuth consent screen */
export async function GET(request) {
  if (!isMicrosoftLoginConfigured()) {
    return NextResponse.redirect(new URL('/signin?auth_error=microsoft_not_configured', appOrigin(request)))
  }
  const origin = appOrigin(request)
  const redirectUri = `${origin}/api/auth/microsoft/callback`
  const state = crypto.randomBytes(16).toString('hex')
  const url = buildMicrosoftLoginUrl({ redirectUri, state })
  const res = NextResponse.redirect(url)
  res.cookies.set('microsoft_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return res
}
