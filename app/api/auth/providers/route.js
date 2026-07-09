import { NextResponse } from 'next/server'
import { isGoogleAuthConfigured } from '@/lib/google-auth'
import { isMicrosoftLoginConfigured } from '@/lib/microsoft-auth'

export async function GET() {
  return NextResponse.json({
    google: isGoogleAuthConfigured(),
    microsoft: isMicrosoftLoginConfigured(),
  })
}
