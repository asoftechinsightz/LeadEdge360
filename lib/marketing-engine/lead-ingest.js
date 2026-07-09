import { randomUUID } from 'crypto'
import { aiScore } from '@/lib/scoring'
import { emitPlatformEvent } from '@/lib/events/bus'
import { PLATFORM_EVENTS } from '@/lib/events/types'
import { LEAD_SOURCES } from './constants.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^\+?[0-9]{10,15}$/

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  if (digits.length >= 10) return `+${digits}`
  return ''
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function classifyIndustry(company = '', message = '') {
  const text = `${company} ${message}`.toLowerCase()
  if (/retail|store|shop|mart/i.test(text)) return 'retail'
  if (/hospital|clinic|health/i.test(text)) return 'healthcare'
  if (/manufactur|factory/i.test(text)) return 'manufacturing'
  if (/bank|finance|insurance/i.test(text)) return 'bfsi'
  if (/school|college|education/i.test(text)) return 'education'
  if (/hotel|restaurant|hospitality/i.test(text)) return 'hospitality'
  return 'it_services'
}

function estimateCompanySize(company = '') {
  if (/enterprise|ltd|pvt|group|corp/i.test(company)) return 'sme'
  if (/startup|studio/i.test(company)) return 'startup'
  return 'unknown'
}

/**
 * Phase 2 — Lead ingestion pipeline
 * Normalize, deduplicate, validate, enrich, store in LeadEdge360.
 */
export async function ingestMarketingLead(db, orgId, raw, { userId = 'marketing-engine' } = {}) {
  const email = normalizeEmail(raw.email)
  const phone = normalizePhone(raw.phone)
  const source = LEAD_SOURCES.includes(raw.source) ? raw.source : (raw.source || 'website').toLowerCase()

  if (!email && !phone) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'email or phone required'
    throw err
  }
  if (email && !EMAIL_RE.test(email)) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'invalid email'
    throw err
  }
  if (phone && !PHONE_RE.test(phone.replace(/\s/g, ''))) {
    const err = new Error('VALIDATION_FAILED')
    err.detail = 'invalid phone'
    throw err
  }

  const dedupeQuery = {
    orgId,
    $or: [
      ...(email ? [{ email }] : []),
      ...(phone ? [{ phone }] : []),
    ],
  }
  const existing = await db.collection('leads').findOne(dedupeQuery, { projection: { _id: 0, id: 1 } })
  if (existing) {
    return { duplicate: true, leadId: existing.id, lead: existing }
  }

  const leadDoc = {
    name: raw.name || raw.fullName || 'Unknown',
    email,
    phone,
    company: raw.company || '',
    message: raw.message || '',
    source,
    territory: raw.territory || raw.city || 'Bengaluru',
    industry: raw.industry || classifyIndustry(raw.company, raw.message),
    companySize: raw.companySize || estimateCompanySize(raw.company),
    decisionMaker: raw.decisionMaker || raw.title || '',
    geo: {
      city: raw.city || '',
      state: raw.state || '',
      country: raw.country || 'India',
      lat: raw.lat || null,
      lng: raw.lng || null,
    },
    budget: Number(raw.budget || 0),
    website: raw.website || '',
  }

  const sc = await aiScore(leadDoc)
  const now = new Date().toISOString()
  const doc = {
    id: randomUUID(),
    orgId,
    ...leadDoc,
    score: sc.score,
    label: sc.label,
    reasons: sc.reasons,
    engine: sc.engine,
    priority: sc.score >= 80 ? 'high' : sc.score >= 50 ? 'medium' : 'low',
    status: 'New',
    assignedTo: raw.assignedTo || null,
    createdAt: now,
    updatedAt: now,
    ingestedBy: 'marketing-engine',
  }

  await db.collection('leads').insertOne(doc)

  await emitPlatformEvent({
    db,
    orgId,
    type: PLATFORM_EVENTS.LEAD_CREATED,
    entity: 'lead',
    entityId: doc.id,
    payload: {
      source,
      name: doc.name,
      score: doc.score,
      leadId: doc.id,
      channel: 'marketing-engine',
    },
    userId,
    source: 'marketing-engine',
  })

  return { duplicate: false, leadId: doc.id, lead: doc }
}

export async function ingestLeadBatch(db, orgId, rows, options = {}) {
  const results = { created: 0, duplicates: 0, errors: [] }
  for (const row of rows) {
    try {
      const r = await ingestMarketingLead(db, orgId, row, options)
      if (r.duplicate) results.duplicates++
      else results.created++
    } catch (err) {
      results.errors.push({ row, error: err.message, detail: err.detail })
    }
  }
  return results
}
