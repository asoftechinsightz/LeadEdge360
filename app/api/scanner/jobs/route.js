import { NextResponse } from 'next/server'
import { createScannerJob } from '@/lib/scanner/jobs'
import { runScannerJob } from '@/lib/scanner/runner'
import { listScannerJobs } from '@/lib/scanner/jobs-api'
import { listScannerResultsByJob } from '@/lib/scanner/results'
import { guardCrmRequest, crmError } from '@/lib/api/route-guards'
import { emitPlatformEvent } from '@/lib/events/bus'
import { PLATFORM_EVENTS } from '@/lib/events/types'
import { getDb } from '@/lib/mongo'
import { DEFAULT_GEO_SOURCES } from '@/lib/scanner/constants'
import { resolveIndianPinCode, normalizeIndianPin } from '@/lib/scanner/pincode'

function resolveSources(body) {
  if (body.sources?.length) return body.sources
  if (body.source === 'Google Maps (Nearby)' || body.source === 'Google Maps') return ['google_maps_nearby']
  if (body.source === 'Google Places (Text)') return ['google_places_text']
  if (body.source === 'Meta (Facebook & Instagram)' || body.source === 'Meta') return ['meta_places']
  if (body.source === 'All Sources (Combined)' || body.source === 'all') return DEFAULT_GEO_SOURCES
  return DEFAULT_GEO_SOURCES
}

export async function GET(request) {
  try {
    const { orgId } = await guardCrmRequest(request)
    const { searchParams } = new URL(request.url)
    const data = await listScannerJobs(
      orgId,
      searchParams.get('page'),
      searchParams.get('limit'),
    )
    return NextResponse.json(data)
  } catch (error) {
    return crmError(error)
  }
}

export async function POST(request) {
  try {
    const { orgId, user } = await guardCrmRequest(request)
    const body = await request.json()
    const db = await getDb()

    const pin = normalizeIndianPin(body.pinCode || body.pin_code)
    if (!pin) {
      return NextResponse.json(
        { success: false, error: 'Valid 6-digit PIN code is required' },
        { status: 400 },
      )
    }

    const resolved = await resolveIndianPinCode(pin)

    const job = await createScannerJob({
      orgId,
      industry: body.industry || 'Business',
      state: resolved.state,
      city: resolved.city,
      district: resolved.district,
      pinCode: resolved.pinCode,
      country: resolved.country,
      radiusKm: Number(body.radiusKm || body.radius || 25),
      sources: resolveSources(body),
      qualityOnly: body.qualityOnly === true,
      createdBy: user?.email || user?.id || 'system',
    })

    if (body.run !== false) {
      const runStats = await runScannerJob(job.id)
      const results = await listScannerResultsByJob(orgId, job.id, { page: 1, limit: 200 })

      await emitPlatformEvent({
        db,
        orgId,
        type: PLATFORM_EVENTS.SCANNER_JOB_COMPLETED,
        entity: 'scanner_job',
        entityId: job.id,
        payload: {
          total: results.total,
          city: job.city,
          industry: job.industry,
          stats: runStats,
        },
        userId: user?.id || null,
        source: 'scanner',
      })

      return NextResponse.json({
        success: true,
        job,
        results: results.items,
        total: results.total,
        stats: runStats,
      })
    }

    return NextResponse.json({ success: true, job })
  } catch (error) {
    console.error('scanner job create error', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create scanner job' },
      { status: 500 },
    )
  }
}
