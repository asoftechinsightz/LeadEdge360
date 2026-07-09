import { NextResponse } from 'next/server'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { getGoogleKeysStatus } from '@/lib/scanner/google-keys'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    await guardCrmRequest(request)
    const keys = getGoogleKeysStatus()
    return NextResponse.json({
      success: true,
      ready: keys.ready,
      maps: keys.maps,
      places: keys.places,
      hint: keys.ready
        ? 'Google API keys configured'
        : 'Add GOOGLE_MAPS_API_KEY and GOOGLE_PLACES_API_KEY to .env (same key works if both APIs enabled)',
    })
  } catch (error) {
    return crmError(error)
  }
}
