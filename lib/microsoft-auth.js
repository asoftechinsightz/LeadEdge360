import crypto from 'crypto'
import {
  buildMicrosoftAuthUrl,
  exchangeMicrosoftCode,
  isMicrosoftOAuthConfigured,
} from '@/lib/integrations/oauth-microsoft'

const LOGIN_SCOPES = ['openid', 'profile', 'email', 'User.Read']

export function isMicrosoftLoginConfigured() {
  return isMicrosoftOAuthConfigured()
}

export function buildMicrosoftLoginUrl({ redirectUri, state }) {
  return buildMicrosoftAuthUrl({
    redirectUri,
    state: state || crypto.randomBytes(16).toString('hex'),
    scopes: LOGIN_SCOPES,
  })
}

export async function exchangeMicrosoftLoginCode(code, redirectUri) {
  const tokens = await exchangeMicrosoftCode(code, redirectUri)
  const res = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  })
  const me = await res.json()
  if (!res.ok) {
    throw new Error(me.error?.message || 'Microsoft profile fetch failed')
  }

  const email = (me.mail || me.userPrincipalName || '').toLowerCase()
  if (!email) throw new Error('Microsoft account has no email')

  return {
    microsoftId: me.id,
    email,
    fullName: me.displayName || email.split('@')[0] || 'User',
    picture: null,
  }
}
