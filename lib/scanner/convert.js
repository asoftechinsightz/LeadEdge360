import { randomUUID } from 'crypto'
import { getDb } from '@/lib/mongo'
import { emitPlatformEvent } from '@/lib/events/bus'
import { PLATFORM_EVENTS } from '@/lib/events/types'
import { calculateLeadScore } from '@/lib/lead-scoring/engine'
import { normalizeCompany, normalizePhoneDigits, normalizeWebsite } from '@/lib/scanner/validate'

async function findExistingLead(db, orgId, result) {
  const phone = normalizePhoneDigits(result.phone)
  const website = normalizeWebsite(result.website)
  const company = normalizeCompany(result.company)

  const or = [{ scannerResultId: result.id }]
  if (phone) {
    or.push({ phoneNormalized: `+91${phone}` })
    or.push({ phone: { $regex: phone } })
  }
  if (website) or.push({ website: { $regex: website.replace(/\./g, '\\.') } })
  if (company) {
    or.push({ companyNormalized: company })
    or.push({ company: result.company })
  }

  return db.collection('leads').findOne({ orgId, $or: or })
}

export async function convertScannerResult(orgId, resultId) {
  const db = await getDb()

  const result = await db.collection('scanner_results').findOne({ orgId, id: resultId })
  if (!result) throw new Error('Result not found')

  const existing = await findExistingLead(db, orgId, result)
  if (existing) {
    return { success: true, duplicate: true, leadId: existing.id }
  }

  const scored = calculateLeadScore({
    ...result,
    industry: result.industry,
    category: result.industry,
  })
  const score = result.score ?? scored.score
  const label = result.label
    || (scored.classification === 'HOT' ? 'Hot' : scored.classification === 'WARM' ? 'Warm' : 'Cold')

  const leadId = randomUUID()
  const sourceMap = {
    google_maps_nearby: 'google_maps',
    google_places_text: 'google_places',
    google_maps: 'google_maps',
    meta_places: 'meta',
  }

  const lead = {
    id: leadId,
    orgId,
    company: result.company,
    companyNormalized: result.companyNormalized || normalizeCompany(result.company),
    phone: result.phone || '',
    phoneNormalized: result.phoneNormalized || '',
    email: '',
    website: result.website || '',
    source: sourceMap[result.source] || 'google_maps',
    status: 'New',
    territory: result.city || '',
    score,
    label,
    assignedTo: '',
    notes: [result.address, result.googleUrl].filter(Boolean).join(' · '),
    industry: result.industry || '',
    quality: result.quality || '',
    scannerJobId: result.jobId,
    scannerResultId: result.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('leads').insertOne(lead)

  await db.collection('lead_timeline').insertOne({
    id: randomUUID(),
    orgId,
    leadId,
    type: 'scanner_conversion',
    payload: {
      company: result.company,
      rating: result.rating,
      reviews: result.reviews,
      source: result.source,
      quality: result.quality,
    },
    createdAt: new Date(),
  })

  await emitPlatformEvent({
    orgId,
    type: PLATFORM_EVENTS.SCANNER_RESULT_CONVERTED,
    entity: 'lead',
    entityId: leadId,
    payload: { scannerResultId: result.id, company: result.company, score },
    source: 'scanner',
  })

  return { success: true, leadId }
}
