#!/usr/bin/env node
/**
 * Provision a separate client-demo tenant (isolated from production org).
 * Seeds realistic Indian B2B sample data for sales demos — idempotent.
 *
 * Usage:
 *   DEMO_ADMIN_EMAIL=demo@asoftechinsightz.com \
 *   DEMO_ADMIN_PASSWORD='SecureDemo@2026' \
 *   npm run demo:provision
 *
 *   # Seed retail + CRM samples into an existing pilot org:
 *   DEMO_ORG_ID=first-customer DEMO_ADMIN_EMAIL=admin@firstcustomer.com \
 *   DEMO_ADMIN_PASSWORD='...' node scripts/provision-client-demo.mjs --org-id first-customer
 *
 * Production org (e.g. asoftechinsightz / admin@asoftechinsightz.com) is never modified.
 */
import { MongoClient } from 'mongodb'
import { randomUUID } from 'crypto'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'
import { hashPassword } from '../lib/password.js'
import { ruleScore } from '../lib/scoring.js'

loadEnvForScripts()

function parseArg(flag) {
  const i = process.argv.indexOf(flag)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null
}

const PRODUCTION_ORG_GUARD = 'asoftechinsightz'
const orgId = parseArg('--org-id') || process.env.DEMO_ORG_ID || 'client-demo'
const orgName = process.env.DEMO_ORG_NAME || 'AsoftechInsightz Client Demo'
const email = process.env.DEMO_ADMIN_EMAIL || 'demo@asoftechinsightz.com'
const password = process.env.DEMO_ADMIN_PASSWORD || ''
const adminName = process.env.DEMO_ADMIN_NAME || 'Demo Presenter'
const phone = process.env.DEMO_ADMIN_PHONE || '+919800000001'
const dryRun = process.argv.includes('--dry-run')

if (!password || password.length < 8) {
  console.error('Set DEMO_ADMIN_PASSWORD (min 8 characters)')
  process.exit(1)
}
if (orgId === PRODUCTION_ORG_GUARD) {
  console.error(`DEMO_ORG_ID cannot be ${PRODUCTION_ORG_GUARD} — use a separate demo org`)
  process.exit(1)
}

const AGENTS = [
  { id: 'a1', name: 'Aarav Sharma', territory: 'Bengaluru' },
  { id: 'a2', name: 'Priya Iyer', territory: 'Bengaluru' },
  { id: 'a3', name: 'Rohan Mehta', territory: 'Mumbai' },
  { id: 'a4', name: 'Neha Kapoor', territory: 'Delhi NCR' },
]

const LEAD_SAMPLES = [
  { name: 'Rahul Verma', email: 'rahul@acmepharma.in', phone: '+919812345671', company: 'Acme Pharma', message: 'Need LeadEdge360 demo for 20 field reps. Budget approved.', budget: 250000, whatsapp: true, territory: 'Bengaluru', source: 'website', status: 'Qualified' },
  { name: 'Sneha Patel', email: 'sneha@bharatrealty.com', phone: '+919812345672', company: 'Bharat Realty', message: 'Interested in territory mapping and AI lead scoring.', budget: 120000, whatsapp: true, territory: 'Mumbai', source: 'google', status: 'Contacted' },
  { name: 'Aditya Rao', email: 'a.rao@swiftmart.com', phone: '+919812345673', company: 'SwiftMart Retail', message: 'Evaluating CRM + RetailEdge360 for 12 stores.', budget: 80000, whatsapp: false, territory: 'Pune', source: 'referral', status: 'Proposal' },
  { name: 'Karan Bhatia', email: 'karan@greenchem.in', phone: '+919812345675', company: 'GreenChem Industries', message: 'Urgent WhatsApp automation needed before quarter end.', budget: 350000, whatsapp: true, territory: 'Hyderabad', source: 'whatsapp', status: 'New' },
  { name: 'Sahil Khan', email: 'sahil@trinityauto.in', phone: '+919812345677', company: 'Trinity Auto', message: 'Ready to buy. Decision this week.', budget: 500000, whatsapp: true, territory: 'Bengaluru', source: 'website', status: 'Negotiation' },
  { name: 'Pooja Shah', email: 'pooja@novaedu.com', phone: '+919812345676', company: 'NovaEdu', message: 'Want a 14-day pilot for admissions team.', budget: 30000, whatsapp: true, territory: 'Delhi NCR', source: 'facebook', status: 'Contacted' },
]

const RETAIL_SKUS = [
  { name: 'Amul Gold Milk 1L', sku: 'DAIRY-001', category: 'dairy', price: 70, stock: 240, daysOnShelf: 3, risk: 'High' },
  { name: 'Britannia Brown Bread', sku: 'BAK-014', category: 'bakery', price: 45, stock: 110, daysOnShelf: 2, risk: 'High' },
  { name: 'Tropicana Orange Juice 1L', sku: 'BEV-202', category: 'beverage', price: 120, stock: 80, daysOnShelf: 12, risk: 'Medium' },
  { name: 'Crocin Advance 500mg', sku: 'PHR-330', category: 'pharma', price: 35, stock: 320, daysOnShelf: 90, risk: 'Low' },
  { name: 'Surf Excel Matic 1kg', sku: 'HHD-77', category: 'household', price: 230, stock: 160, daysOnShelf: 20, risk: 'Medium' },
  { name: 'Bananas Robusta 1kg', sku: 'PROD-04', category: 'produce', price: 60, stock: 95, daysOnShelf: 1, risk: 'High' },
]

function assignAgent(territory) {
  const pool = AGENTS.filter((a) => a.territory === territory)
  const list = pool.length ? pool : AGENTS
  return list[Math.floor(Math.random() * list.length)]
}

function addDays(d) {
  const x = new Date()
  x.setDate(x.getDate() + d)
  return x.toISOString()
}

async function upsert(db, collection, filter, doc, { insertOnly = false } = {}) {
  if (dryRun) {
    console.log(`[dry-run] ${collection}`, filter)
    return
  }
  const createdAt = doc.createdAt || doc.updatedAt || new Date().toISOString()
  const { createdAt: _drop, ...fields } = doc

  if (insertOnly) {
    await db.collection(collection).updateOne(
      filter,
      { $setOnInsert: { ...fields, ...filter, createdAt } },
      { upsert: true },
    )
    return
  }

  await db.collection(collection).updateOne(
    filter,
    { $set: fields, $setOnInsert: { createdAt } },
    { upsert: true },
  )
}

async function resolvePhone(db, existing) {
  if (existing?.phone && !process.env.DEMO_ADMIN_PHONE) {
    return existing.phone
  }
  const candidate = process.env.DEMO_ADMIN_PHONE || phone
  const taken = await db.collection('users').findOne({
    phone: candidate,
    email: { $ne: email },
  })
  if (!taken) return candidate
  if (existing?.phone) return existing.phone
  const n = (Math.abs(orgId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 90000000) + 10000000
  return `+91${n}`
}

async function provisionTenant(db, now) {
  const passwordHash = await hashPassword(password)
  const userId = randomUUID()

  const existing = await db.collection('users').findOne({ email })
  const uid = existing?.id || userId
  const resolvedPhone = await resolvePhone(db, existing)

  await upsert(db, 'orgs', { id: orgId }, {
    id: orgId,
    name: orgName,
    ownerEmail: email,
    plan: 'scale',
    leadEnabled: true,
    retailEnabled: true,
    demo: true,
    pilot: false,
    updatedAt: now,
  })

  const userDoc = {
    id: uid,
    orgId,
    email,
    fullName: existing?.fullName || adminName,
    name: existing?.name || adminName,
    passwordHash,
    role: 'admin',
    status: 'active',
    businessSuiteEnabled: true,
    products: ['leadedge360', 'retailedge360'],
    activeProduct: 'leadedge360',
    emailVerified: true,
    phoneVerified: true,
    phone: resolvedPhone,
    updatedAt: now,
  }
  if (existing) {
    delete userDoc.passwordHash
  }
  await upsert(db, 'users', { email }, userDoc)

  await upsert(db, 'subscriptions', { orgId, status: 'ACTIVE' }, {
    id: `sub-${orgId}`,
    orgId,
    planCode: 'ENTERPRISE',
    status: 'ACTIVE',
    amount: 149999,
    billingCycle: 'monthly',
    demo: true,
    activatedAt: new Date(),
    updatedAt: now,
  })

  await upsert(db, 'org_branding', { orgId }, {
    orgId,
    companyName: orgName,
    legalName: 'AsoftechInsightz Demo Pvt Ltd',
    tagline: 'LeadEdge360 + RetailEdge360 — live demo environment',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    gstin: '29AAAAA0000A1Z5',
    supportEmail: email,
    website: 'https://app.asoftechinsightz.com',
    primaryColor: '#0A1F44',
    secondaryColor: '#0066FF',
    proposalPrefix: 'DEMO-PROP',
    invoicePrefix: 'DEMO-INV',
    updatedAt: now,
  })

  console.log(`[tenant] org=${orgId} user=${email}`)
  return uid
}

async function seedLeads(db, now) {
  const leadIds = []
  for (let i = 0; i < LEAD_SAMPLES.length; i++) {
    const s = LEAD_SAMPLES[i]
    const id = `demo-lead-${i + 1}-${orgId}`
    const sc = ruleScore(s)
    const agent = assignAgent(s.territory)
    await upsert(db, 'leads', { orgId, id }, {
      id,
      orgId,
      ...s,
      score: sc.score,
      label: sc.label,
      reasons: sc.reasons,
      engine: sc.engine,
      assignedTo: agent.name,
      assignedAgentId: agent.id,
      createdAt: new Date(Date.now() - (LEAD_SAMPLES.length - i) * 86400000).toISOString(),
      updatedAt: now,
    })
    leadIds.push(id)
  }
  console.log(`[seed] ${leadIds.length} leads`)
  return leadIds
}

async function seedOpportunities(db, now, leadIds) {
  const stages = ['Qualification', 'Proposal', 'Negotiation']
  for (let i = 0; i < Math.min(3, leadIds.length); i++) {
    const id = `demo-opp-${i + 1}-${orgId}`
    await upsert(db, 'opportunities', { orgId, id }, {
      id,
      orgId,
      title: `${LEAD_SAMPLES[i].company} — Enterprise CRM`,
      stage: stages[i],
      status: 'open',
      leadId: leadIds[i],
      value: LEAD_SAMPLES[i].budget || 75000,
      expectedValue: LEAD_SAMPLES[i].budget || 75000,
      assignedTo: assignAgent(LEAD_SAMPLES[i].territory).name,
      updatedAt: now,
    })
  }
  console.log('[seed] 3 opportunities')
}

async function seedCustomers(db, now) {
  const customers = [
    { id: `demo-cust-1-${orgId}`, name: 'Trinity Auto Group', company: 'Trinity Auto', email: 'billing@trinityauto.in', phone: '+919812345677', tags: ['enterprise', 'automotive'] },
    { id: `demo-cust-2-${orgId}`, name: 'GreenChem Industries', company: 'GreenChem', email: 'karan@greenchem.in', phone: '+919812345675', tags: ['manufacturing'] },
    { id: `demo-cust-3-${orgId}`, name: 'SwiftMart Retail', company: 'SwiftMart', email: 'ops@swiftmart.com', phone: '+919812345673', tags: ['retail', 'multi-store'] },
  ]
  for (const c of customers) {
    await upsert(db, 'customers', { orgId, id: c.id }, {
      ...c,
      orgId,
      status: 'active',
      territory: 'Bengaluru',
      updatedAt: now,
    })
  }
  console.log(`[seed] ${customers.length} customers`)
}

async function seedRetail(db, now, userId) {
  const storeId = `demo-store-${orgId}`
  await upsert(db, 'retail_stores', { orgId, id: storeId }, {
    id: storeId,
    orgId,
    code: 'DEMO-01',
    name: 'Demo Flagship Store',
    active: true,
    createdBy: userId,
    updatedBy: userId,
    updatedAt: now,
  })

  for (const item of RETAIL_SKUS) {
    const productId = `demo-prod-${item.sku}-${orgId}`
    const invId = `demo-inv-${item.sku}-${orgId}`
    await upsert(db, 'retail_products', { orgId, sku: item.sku }, {
      id: productId,
      orgId,
      sku: item.sku,
      name: item.name,
      category: item.category,
      price: item.price,
      unit: 'pcs',
      active: true,
      predictedShelfDays: item.risk === 'High' ? 5 : item.risk === 'Medium' ? 18 : 90,
      risk: item.risk,
      recommendation: item.risk === 'High' ? 'Discount and promote immediately' : 'Monitor weekly',
      reasoning: [`Category: ${item.category}`, `${item.daysOnShelf} days on shelf`],
      engine: 'rules',
      createdBy: userId,
      updatedBy: userId,
      updatedAt: now,
    })
    await upsert(db, 'retail_inventory', { orgId, id: invId }, {
      id: invId,
      orgId,
      storeId,
      productId,
      quantity: item.stock,
      reservedQty: 0,
      reorderLevel: 10,
      daysOnShelf: item.daysOnShelf,
      expiryDate: addDays(item.risk === 'High' ? 5 : 60),
      createdBy: userId,
      updatedBy: userId,
      updatedAt: now,
    })
  }
  console.log(`[seed] ${RETAIL_SKUS.length} retail SKUs + inventory`)
}

async function verifyLogin() {
  const base = process.env.RETEST_API_BASE || 'http://127.0.0.1:3000/api'
  if (dryRun) return
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/auth/login-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(10000),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.accessToken) {
      console.log('[verify] demo login OK')
      console.log(`[verify] orgId in token tenant: ${data.user?.orgId}`)
    } else {
      console.warn(`[verify] login failed (${res.status})`)
    }
  } catch (e) {
    console.warn(`[verify] login skipped: ${e.message}`)
  }
}

async function main() {
  const { mongoUrl, dbName } = getMongoConnectConfig()
  const now = new Date().toISOString()

  console.log('\n=== Client demo provisioning ===')
  console.log(`  database: ${dbName}`)
  console.log(`  demo org: ${orgId} (production org ${PRODUCTION_ORG_GUARD} untouched)`)
  console.log(`  demo user: ${email}`)
  if (dryRun) console.log('  mode: DRY RUN\n')

  const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 15000 })
  await client.connect()
  const db = client.db(dbName)

  try {
    const conflict = await db.collection('users').findOne({
      email,
      orgId: { $ne: orgId },
    })
    if (conflict) {
      throw new Error(`Email ${email} already used by org ${conflict.orgId}`)
    }

    const userId = await provisionTenant(db, now)
    const leadIds = await seedLeads(db, now)
    await seedOpportunities(db, now, leadIds)
    await seedCustomers(db, now)
    await seedRetail(db, now, userId)
    await verifyLogin()

    console.log('\nDone. Use these accounts:')
    console.log(`  Production: admin@asoftechinsightz.com → org ${PRODUCTION_ORG_GUARD}`)
    console.log(`  Demo:       ${email} → org ${orgId}`)
    console.log('  Sign in at: https://app.asoftechinsightz.com/signin\n')
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error('[demo:provision] failed:', err.message)
  process.exit(1)
})
