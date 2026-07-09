#!/usr/bin/env node
/**
 * Provision a production pilot tenant: org + admin + subscription + branding + AI settings.
 *
 * Usage:
 *   PILOT_ORG_NAME="Acme Pvt Ltd" \
 *   PILOT_ADMIN_EMAIL=admin@acme.com \
 *   PILOT_ADMIN_PASSWORD='StrongPass@2026' \
 *   npm run pilot:provision
 *
 * Flags:
 *   --dry-run       Print planned writes without touching the database
 *   --seed-sample   Seed org-scoped sample leads + catalog (idempotent)
 *
 * Docs: docs/platform/PILOT_PROVISIONING.md
 */
import { MongoClient } from 'mongodb'
import { randomUUID } from 'crypto'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'
import { hashPassword } from '../lib/password.js'
import { applyIndustryProfile, getIndustryProfile, listIndustryProfiles } from '../lib/agents/industry-profiles.js'

const DEMO_ORG_ID = 'demo-org'
const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const seedSample = args.has('--seed-sample') || ['1', 'true', 'yes'].includes(String(process.env.PILOT_SEED_SAMPLE || '').toLowerCase())

loadEnvForScripts()

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || `pilot-${Date.now()}`
}

function uniquePilotPhone(orgId) {
  const digits = orgId.replace(/\D/g, '').slice(-8).padStart(8, '0')
  return `+9198${digits}`
}

function env(name, fallback = '') {
  return process.env[name]?.trim() || fallback
}

const config = {
  orgId: env('PILOT_ORG_ID'),
  orgName: env('PILOT_ORG_NAME'),
  adminEmail: env('PILOT_ADMIN_EMAIL'),
  adminPassword: env('PILOT_ADMIN_PASSWORD'),
  adminName: env('PILOT_ADMIN_NAME', 'Pilot Administrator'),
  adminPhone: env('PILOT_ADMIN_PHONE'),
  industry: env('PILOT_INDUSTRY', 'it_services'),
  planCode: env('PILOT_PLAN_CODE', 'ENTERPRISE'),
  branding: {
    companyName: env('PILOT_ORG_NAME'),
    legalName: env('PILOT_COMPANY_LEGAL_NAME') || env('PILOT_ORG_NAME'),
    tagline: env('PILOT_TAGLINE', ''),
    addressLine1: env('PILOT_ADDRESS_LINE1', ''),
    addressLine2: env('PILOT_ADDRESS_LINE2', ''),
    city: env('PILOT_CITY', ''),
    state: env('PILOT_STATE', ''),
    pin: env('PILOT_PIN', ''),
    country: env('PILOT_COUNTRY', 'India'),
    gstin: env('PILOT_GSTIN', ''),
    pan: env('PILOT_PAN', ''),
    phone: env('PILOT_COMPANY_PHONE') || env('PILOT_ADMIN_PHONE', ''),
    supportEmail: env('PILOT_SUPPORT_EMAIL') || env('PILOT_ADMIN_EMAIL'),
    website: env('PILOT_WEBSITE', ''),
    primaryColor: env('PILOT_PRIMARY_COLOR', '#0A1F44'),
    secondaryColor: env('PILOT_SECONDARY_COLOR', '#0066FF'),
    proposalPrefix: env('PILOT_PROPOSAL_PREFIX', 'PROP'),
    invoicePrefix: env('PILOT_INVOICE_PREFIX', 'INV'),
    placeOfSupply: env('PILOT_PLACE_OF_SUPPLY', env('PILOT_STATE', '')),
    gstType: env('PILOT_GST_TYPE', 'CGST_SGST'),
    authorizedSignatory: env('PILOT_SIGNATORY', env('PILOT_ADMIN_NAME', 'Pilot Administrator')),
    signatoryTitle: env('PILOT_SIGNATORY_TITLE', 'Authorised Signatory'),
    termsAndConditions: env(
      'PILOT_TERMS',
      'Payment due within 15 days of invoice date.\nAll information is confidential.',
    ).split('\n').filter(Boolean),
    invoiceNotes: env('PILOT_INVOICE_NOTES', 'Thank you for your business.'),
  },
}

/** Tracks documents inserted during this run for rollback on failure. */
class RollbackTracker {
  constructor(db) {
    this.db = db
    this.inserts = []
  }

  track(collection, filter) {
    this.inserts.push({ collection, filter })
  }

  trackUpsert(collection, filter, result) {
    if (result?.upsertedCount > 0 || result?.upsertedId) {
      this.track(collection, filter)
    }
  }

  async rollback() {
    if (!this.inserts.length) return
    console.warn(`[rollback] reverting ${this.inserts.length} inserted document(s)`)
    for (const { collection, filter } of [...this.inserts].reverse()) {
      try {
        await this.db.collection(collection).deleteOne(filter)
        console.warn(`[rollback] deleted ${collection}`, JSON.stringify(filter))
      } catch (err) {
        console.warn(`[rollback] failed ${collection}: ${err.message}`)
      }
    }
  }
}

function validateConfig() {
  const missing = []
  if (!config.orgName) missing.push('PILOT_ORG_NAME')
  if (!config.adminEmail) missing.push('PILOT_ADMIN_EMAIL')
  if (!config.adminPassword) missing.push('PILOT_ADMIN_PASSWORD')
  if (config.adminPassword && config.adminPassword.length < 8) {
    console.error('[pilot:provision] PILOT_ADMIN_PASSWORD must be at least 8 characters')
    process.exit(1)
  }
  if (missing.length) {
    console.error(`[pilot:provision] Missing required env: ${missing.join(', ')}`)
    process.exit(1)
  }

  if (!config.orgId) config.orgId = slugify(config.orgName)
  if (config.orgId === DEMO_ORG_ID) {
    console.error('[pilot:provision] PILOT_ORG_ID cannot be demo-org')
    process.exit(1)
  }
  if (!getIndustryProfile(config.industry)) {
    const valid = listIndustryProfiles().map((p) => p.id).join(', ')
    console.error(`[pilot:provision] Unknown PILOT_INDUSTRY=${config.industry}. Valid: ${valid}`)
    process.exit(1)
  }
  if (!config.adminPhone) config.adminPhone = uniquePilotPhone(config.orgId)
  if (!config.branding.phone) config.branding.phone = config.adminPhone
}

async function assertNoConflicts(db) {
  const [emailUser, phoneUser] = await Promise.all([
    db.collection('users').findOne({ email: config.adminEmail }),
    db.collection('users').findOne({ phone: config.adminPhone }),
  ])

  if (emailUser && emailUser.orgId !== config.orgId) {
    throw new Error(`Email ${config.adminEmail} already belongs to org ${emailUser.orgId}`)
  }
  if (phoneUser && phoneUser.orgId !== config.orgId && phoneUser.email !== config.adminEmail) {
    throw new Error(`Phone ${config.adminPhone} already belongs to user ${phoneUser.email}`)
  }

  return { emailUser, phoneUser }
}

async function provisionOrg(db, now, tracker) {
  const orgDoc = {
    id: config.orgId,
    name: config.orgName,
    ownerEmail: config.adminEmail,
    plan: config.planCode === 'ENTERPRISE' ? 'scale' : 'growth',
    leadEnabled: true,
    retailEnabled: true,
    pilot: true,
    orgType: 'customer',
    subscriptionEnforcement: 'standard',
    demo: false,
    updatedAt: now,
  }
  if (dryRun) {
    console.log('[dry-run] org', orgDoc)
    return
  }
  const result = await db.collection('orgs').updateOne(
    { id: config.orgId },
    { $set: orgDoc, $setOnInsert: { createdAt: now } },
    { upsert: true },
  )
  tracker.trackUpsert('orgs', { id: config.orgId }, result)
  console.log(`[org] ${config.orgId} — ${config.orgName}`)
}

async function provisionAdmin(db, now, emailUser, tracker) {
  const passwordHash = await hashPassword(config.adminPassword)
  const userId = emailUser?.id || randomUUID()
  const userDoc = {
    id: userId,
    orgId: config.orgId,
    email: config.adminEmail,
    fullName: config.adminName,
    name: config.adminName,
    passwordHash,
    role: 'admin',
    status: 'active',
    businessSuiteEnabled: true,
    products: ['leadedge360'],
    activeProduct: 'leadedge360',
    emailVerified: true,
    phoneVerified: true,
    phone: config.adminPhone,
    updatedAt: now,
  }

  if (dryRun) {
    console.log('[dry-run] admin user', { ...userDoc, passwordHash: '[bcrypt]' })
    return userId
  }

  if (emailUser) {
    await db.collection('users').updateOne({ email: config.adminEmail }, { $set: userDoc })
    console.log(`[user] updated ${config.adminEmail}`)
  } else {
    await db.collection('users').insertOne({ ...userDoc, createdAt: now })
    tracker.track('users', { id: userId })
    console.log(`[user] created ${config.adminEmail}`)
  }
  return userId
}

async function provisionSubscription(db, now, tracker) {
  const subDoc = {
    orgId: config.orgId,
    planCode: config.planCode,
    status: 'ACTIVE',
    amount: config.planCode === 'ENTERPRISE' ? 149999 : 49999,
    billingCycle: 'monthly',
    pilot: true,
    activatedAt: new Date(),
    updatedAt: now,
  }
  if (dryRun) {
    console.log('[dry-run] subscription', subDoc)
    return
  }
  const result = await db.collection('subscriptions').updateOne(
    { orgId: config.orgId, status: 'ACTIVE' },
    { $set: subDoc, $setOnInsert: { id: randomUUID(), createdAt: now } },
    { upsert: true },
  )
  tracker.trackUpsert('subscriptions', { orgId: config.orgId, status: 'ACTIVE' }, result)
  console.log(`[subscription] ${config.planCode} ACTIVE`)
}

async function provisionBranding(db, now, tracker) {
  const brandingDoc = {
    orgId: config.orgId,
    ...config.branding,
    updatedAt: now,
  }
  if (dryRun) {
    console.log('[dry-run] org_branding', brandingDoc)
    return
  }
  const brandingResult = await db.collection('org_branding').updateOne(
    { orgId: config.orgId },
    { $set: brandingDoc, $setOnInsert: { createdAt: now } },
    { upsert: true },
  )
  tracker.trackUpsert('org_branding', { orgId: config.orgId }, brandingResult)

  const profileResult = await db.collection('onboarding_profiles').updateOne(
    { orgId: config.orgId },
    {
      $set: {
        orgId: config.orgId,
        companyName: config.branding.companyName,
        email: config.branding.supportEmail,
        website: config.branding.website,
        address: config.branding.addressLine1,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  )
  tracker.trackUpsert('onboarding_profiles', { orgId: config.orgId }, profileResult)
  console.log('[branding] GST, prefixes, org_branding configured')
}

async function provisionTemplates(db, now, tracker) {
  const proposalTemplate = {
    orgId: config.orgId,
    name: 'Standard Proposal',
    body: `Thank you for your interest in ${config.orgName}. We look forward to partnering with you.`,
    isDefault: true,
    updatedAt: now,
  }
  if (dryRun) {
    console.log('[dry-run] proposal_templates', proposalTemplate)
    return
  }
  const result = await db.collection('proposal_templates').updateOne(
    { orgId: config.orgId, isDefault: true },
    { $set: proposalTemplate, $setOnInsert: { createdAt: new Date(now) } },
    { upsert: true },
  )
  tracker.trackUpsert('proposal_templates', { orgId: config.orgId, isDefault: true }, result)
  console.log('[templates] default proposal template')
}

async function provisionIndustry(db, tracker) {
  if (dryRun) {
    console.log(`[dry-run] industry profile ${config.industry}`)
    return
  }
  const beforeProfile = await db.collection('org_industry_profile').findOne({ orgId: config.orgId })
  const beforeAi = await db.collection('org_ai_settings').findOne({ orgId: config.orgId })

  const result = await applyIndustryProfile(db, config.orgId, config.industry)
  if (!beforeProfile) tracker.track('org_industry_profile', { orgId: config.orgId })

  const aiResult = await db.collection('org_ai_settings').updateOne(
    { orgId: config.orgId },
    {
      $set: {
        enabled: true,
        monthlyTokenBudget: Number(env('PILOT_AI_TOKEN_BUDGET', '500000')),
        monthlyCostBudget: Number(env('PILOT_AI_COST_BUDGET', '500')),
        businessHours: { enabled: false },
        updatedAt: new Date().toISOString(),
      },
      $setOnInsert: { orgId: config.orgId, createdAt: new Date().toISOString() },
    },
    { upsert: true },
  )
  if (!beforeAi) tracker.trackUpsert('org_ai_settings', { orgId: config.orgId }, aiResult)

  console.log(`[ai] industry=${result.profile.name}, agents=${result.agentsApplied}`)
}

async function seedSampleData(db, now, tracker) {
  const samples = [
    {
      id: `pilot-sample-lead-1-${config.orgId}`,
      name: 'Sample Prospect Alpha',
      email: `alpha@${config.orgId}.pilot.local`,
      phone: `+9197000${config.orgId.slice(-4).padStart(4, '0')}1`,
      company: `${config.orgName} Prospect Co`,
      status: 'New',
      source: 'website',
      message: 'Pilot sample lead — safe to delete after onboarding.',
    },
    {
      id: `pilot-sample-lead-2-${config.orgId}`,
      name: 'Sample Prospect Beta',
      email: `beta@${config.orgId}.pilot.local`,
      phone: `+9197000${config.orgId.slice(-4).padStart(4, '0')}2`,
      company: 'Beta Industries',
      status: 'Contacted',
      source: 'referral',
      message: 'Second pilot sample lead.',
    },
  ]

  const catalogs = [
    { orgId: config.orgId, name: 'Professional Services', price: 75000, sku: `CAT-1-${config.orgId}` },
    { orgId: config.orgId, name: 'Implementation Package', price: 125000, sku: `CAT-2-${config.orgId}` },
  ]

  if (dryRun) {
    console.log('[dry-run] sample leads', samples.length)
    console.log('[dry-run] sample catalogs', catalogs.length)
    return
  }

  for (const lead of samples) {
    const result = await db.collection('leads').updateOne(
      { orgId: config.orgId, id: lead.id },
      { $set: { ...lead, orgId: config.orgId, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    )
    tracker.trackUpsert('leads', { orgId: config.orgId, id: lead.id }, result)
  }

  for (const item of catalogs) {
    const result = await db.collection('catalogs').updateOne(
      { orgId: config.orgId, sku: item.sku },
      { $set: { ...item, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    )
    tracker.trackUpsert('catalogs', { orgId: config.orgId, sku: item.sku }, result)
  }

  const oppId = `pilot-sample-opp-${config.orgId}`
  const oppResult = await db.collection('opportunities').updateOne(
    { orgId: config.orgId, id: oppId },
    {
      $set: {
        id: oppId,
        orgId: config.orgId,
        title: 'Sample Opportunity',
        stage: 'Qualification',
        status: 'open',
        leadId: samples[0].id,
        value: 75000,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  )
  tracker.trackUpsert('opportunities', { orgId: config.orgId, id: oppId }, oppResult)
  console.log(`[sample] ${samples.length} leads, ${catalogs.length} catalog items, 1 opportunity`)
}

async function writeAudit(db, userId, now, tracker) {
  if (dryRun) return
  const audit = {
    id: randomUUID(),
    orgId: config.orgId,
    userId,
    actorType: 'system',
    action: 'pilot_org_provisioned',
    entity: 'org',
    entityId: config.orgId,
    detail: `Pilot provision: ${config.orgName} (${config.planCode}, industry=${config.industry})`,
    createdAt: now,
  }
  await db.collection('audit_logs').insertOne(audit)
  tracker.track('audit_logs', { id: audit.id })
}

async function verifyLogin() {
  const base = process.env.RETEST_API_BASE || process.env.PILOT_API_BASE
  if (!base || dryRun) return
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/auth/login-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: config.adminEmail, password: config.adminPassword }),
      signal: AbortSignal.timeout(10000),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.accessToken) {
      console.log('[verify] login-password OK')
    } else {
      console.warn(`[verify] login-password failed (${res.status}): ${data.message || data.code || 'unknown'}`)
    }
  } catch (err) {
    console.warn(`[verify] login skipped: ${err.message}`)
  }
}

async function main() {
  validateConfig()
  const { mongoUrl, dbName } = getMongoConnectConfig()
  const now = new Date().toISOString()

  console.log(`\n[pilot:provision] ${dbName} @ ${mongoUrl.replace(/\/\/[^@]+@/, '//***@')}`)
  console.log(`  orgId:    ${config.orgId}`)
  console.log(`  admin:    ${config.adminEmail}`)
  console.log(`  phone:    ${config.adminPhone}`)
  console.log(`  plan:     ${config.planCode}`)
  console.log(`  industry: ${config.industry}`)
  console.log(`  sample:   ${seedSample ? 'yes' : 'no'}`)
  if (dryRun) console.log('  mode:     DRY RUN\n')
  else console.log('')

  const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 15000 })
  await client.connect()
  const db = client.db(dbName)
  const tracker = new RollbackTracker(db)

  try {
    const { emailUser } = await assertNoConflicts(db)
    await provisionOrg(db, now, tracker)
    const userId = await provisionAdmin(db, now, emailUser, tracker)
    await provisionSubscription(db, now, tracker)
    await provisionBranding(db, now, tracker)
    await provisionTemplates(db, now, tracker)
    await provisionIndustry(db, tracker)
    if (seedSample) await seedSampleData(db, now, tracker)
    await writeAudit(db, userId, now, tracker)
  } catch (err) {
    if (!dryRun) await tracker.rollback()
    throw err
  } finally {
    await client.close()
  }

  await verifyLogin()

  console.log('\n[pilot:provision] done')
  console.log('Next steps:')
  console.log(`  1. Sign in: ${config.adminEmail}`)
  console.log('  2. Settings → Document branding — upload logo / signature')
  console.log('  3. Confirm GST and invoice prefix before first invoice')
  console.log('  4. Set NEXT_PUBLIC_APP_ENV=production and rebuild app container\n')
}

main().catch((err) => {
  console.error('[pilot:provision] failed:', err.message)
  process.exit(1)
})
