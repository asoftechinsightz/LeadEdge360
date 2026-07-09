import { getScannerCollections } from '@/lib/scanner/db'
import { geocodeLocation } from '@/lib/scanner/geocode'
import { getPlaceDetails } from '@/lib/scanner/providers/google'
import { searchAllProviders, enrichMetaPlace } from '@/lib/scanner/providers/index'
import { buildHash } from '@/lib/scanner/dedupe'
import { validateScannerResult } from '@/lib/scanner/validate'
import { calculateLeadScore } from '@/lib/lead-scoring/engine'
import { resolveIndianPinCode, normalizeIndianPin } from '@/lib/scanner/pincode'

async function enrichPlace(place, job, source) {
  if (source === 'meta_places' || String(place.place_id || '').startsWith('meta:')) {
    return enrichMetaPlace(place, job, source)
  }

  let details = {}
  try {
    details = await getPlaceDetails(place.place_id)
  } catch (err) {
    console.error('Place Details Error:', place.place_id, err.message)
  }

  return {
    id: place.place_id,
    jobId: job.id,
    orgId: job.orgId,
    company: details.name || place.name || '',
    address: details.formatted_address || place.formatted_address || place.vicinity || '',
    city: job.city,
    state: job.state,
    pinCode: job.pinCode || '',
    country: job.country || 'India',
    industry: job.industry,
    phone: details.formatted_phone_number || details.international_phone_number || '',
    website: details.website || '',
    googleUrl: details.url || '',
    businessStatus: details.business_status || '',
    rating: place.rating || 0,
    reviews: place.user_ratings_total || 0,
    placeId: place.place_id,
    source,
    latitude: place.geometry?.location?.lat,
    longitude: place.geometry?.location?.lng,
    createdAt: new Date().toISOString(),
  }
}

export async function runScannerJob(jobId) {
  const { jobs, results } = await getScannerCollections()

  const job = await jobs.findOne({ id: jobId })
  if (!job) throw new Error('Job not found')

  await jobs.updateOne(
    { id: jobId },
    { $set: { status: 'RUNNING', startedAt: new Date().toISOString(), error: null } },
  )

  const stats = {
    totalFound: 0,
    totalStored: 0,
    totalRejected: 0,
    totalDuplicates: 0,
    bySource: {},
  }

  try {
    const pin = normalizeIndianPin(job.pinCode)
    if (!pin) {
      throw new Error('Valid 6-digit PIN code is required')
    }

    const resolved = await resolveIndianPinCode(pin)
    const location = {
      pinCode: resolved.pinCode,
      city: resolved.city,
      state: resolved.state,
      district: resolved.district,
      country: resolved.country,
      area: resolved.area,
    }

    await jobs.updateOne(
      { id: jobId },
      { $set: { ...location, locationResolvedAt: new Date().toISOString() } },
    )

    const geo = await geocodeLocation(location.city, location.state, {
      pinCode: location.pinCode,
      country: location.country,
    })

    const jobWithLocation = { ...job, ...location }
    const { places, warnings } = await searchAllProviders(jobWithLocation, geo)
    stats.totalFound = places.length
    if (warnings?.length) stats.warnings = warnings

    const qualityOnly = job.qualityOnly === true
    stats.qualityOnly = qualityOnly

    for (const { place, source } of places) {
      stats.bySource[source] = (stats.bySource[source] || 0) + 1

      const item = await enrichPlace(place, jobWithLocation, source)
      const validation = validateScannerResult(item, { qualityOnly })

      if (!validation.valid) {
        stats.totalRejected++
        const reason = validation.reasons[0] || 'quality'
        stats.rejectReasons = stats.rejectReasons || {}
        stats.rejectReasons[reason] = (stats.rejectReasons[reason] || 0) + 1
        continue
      }

      item.phone = validation.phoneNormalized || item.phone
      item.phoneNormalized = validation.phoneNormalized
      item.companyNormalized = validation.companyNormalized
      item.websiteNormalized = validation.websiteNormalized
      item.quality = validation.quality
      item.validationReasons = validation.reasons

      const scored = calculateLeadScore({
        ...item,
        industry: jobWithLocation.industry,
        category: jobWithLocation.industry,
      })
      item.score = scored.score
      item.label = scored.classification === 'HOT' ? 'Hot'
        : scored.classification === 'WARM' ? 'Warm' : 'Cold'
      item.scoreReasons = scored.reasons

      item.dedupeHash = buildHash(item)

      try {
        await results.insertOne(item)
        stats.totalStored++
      } catch (err) {
        if (err.code === 11000) {
          stats.totalDuplicates++
        } else {
          throw err
        }
      }
    }

    await jobs.updateOne(
      { id: job.id },
      {
        $set: {
          status: 'COMPLETED',
          totalFound: stats.totalFound,
          totalStored: stats.totalStored,
          totalRejected: stats.totalRejected,
          totalDuplicates: stats.totalDuplicates,
          stats,
          completedAt: new Date().toISOString(),
        },
      },
    )

    return { success: true, ...stats }
  } catch (err) {
    await jobs.updateOne(
      { id: job.id },
      {
        $set: {
          status: 'FAILED',
          error: err.message,
          completedAt: new Date().toISOString(),
        },
      },
    )
    throw err
  }
}
