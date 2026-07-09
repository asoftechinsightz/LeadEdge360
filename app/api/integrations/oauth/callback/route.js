export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { completeOAuthCallback } from '@/lib/integrations/service'

export async function GET(req) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  const settingsPath = '/settings?tab=integrations'

  if (error) {
    return NextResponse.redirect(`${settingsPath}&oauth=error&reason=${encodeURIComponent(error)}`)
  }
  if (!code || !state) {
    return NextResponse.redirect(`${settingsPath}&oauth=error&reason=missing_params`)
  }

  try {
    const result = await completeOAuthCallback({ state, code })
    const q = result.status === 'connected' ? 'success' : 'error'
    return NextResponse.redirect(`${settingsPath}&oauth=${q}&integration=${result.integrationId}`)
  } catch (e) {
    return NextResponse.redirect(`${settingsPath}&oauth=error&reason=${encodeURIComponent(e.message)}`)
  }
}
