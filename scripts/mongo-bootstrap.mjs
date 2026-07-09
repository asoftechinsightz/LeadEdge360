/**
 * One-shot MongoDB setup — indexes + demo org, admin user, subscription, sample business card.
 *
 * Run AFTER MongoDB is installed (local, Docker, or Atlas):
 *   node scripts/mongo-bootstrap.mjs
 *
 * Env (from .env or shell):
 *   MONGO_URL=mongodb://127.0.0.1:27017
 *   DB_NAME=asoftech
 *
 * Atlas example:
 *   MONGO_URL="mongodb+srv://USER:PASS@cluster.mongodb.net/?retryWrites=true&w=majority"
 *   DB_NAME=asoftech
 */
import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
import { loadEnvForScripts, getMongoConnectConfig } from '../lib/mongo-connect.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

loadEnvForScripts()
const { mongoUrl: MONGO_URL, dbName: DB_NAME } = getMongoConnectConfig()

const DEMO_ORG_ID = 'demo-org'
const ADMIN_EMAIL = 'admin@asoftechinsightz.com'
const ADMIN_PASSWORD = 'ChangeMe@2025'

const INDEXES = [
  { collection: 'users', key: { email: 1 }, options: { unique: true, name: 'users_email_unique' } },
  { collection: 'users', key: { orgId: 1 }, options: { name: 'users_orgId' } },
  { collection: 'leads', key: { orgId: 1, id: 1 }, options: { name: 'leads_orgId_id' } },
  { collection: 'leads', key: { orgId: 1, createdAt: -1 }, options: { name: 'leads_orgId_createdAt' } },
  { collection: 'leads', key: { orgId: 1, status: 1 }, options: { name: 'leads_orgId_status' } },
  { collection: 'opportunities', key: { orgId: 1, id: 1 }, options: { name: 'opportunities_orgId_id' } },
  { collection: 'opportunities', key: { orgId: 1, stage: 1 }, options: { name: 'opportunities_orgId_stage' } },
  { collection: 'proposals', key: { orgId: 1, id: 1 }, options: { name: 'proposals_orgId_id' } },
  { collection: 'campaigns', key: { orgId: 1, createdAt: -1 }, options: { name: 'campaigns_orgId_createdAt' } },
  { collection: 'subscriptions', key: { orgId: 1, status: 1 }, options: { name: 'subscriptions_orgId_status' } },
  { collection: 'customers', key: { orgId: 1, id: 1 }, options: { name: 'customers_orgId_id' } },
  { collection: 'invoices', key: { orgId: 1, createdAt: -1 }, options: { name: 'invoices_orgId_createdAt' } },
  { collection: 'payments', key: { orgId: 1, orderId: 1 }, options: { name: 'payments_orgId_orderId' } },
  { collection: 'audit_logs', key: { orgId: 1, createdAt: -1 }, options: { name: 'audit_logs_orgId_createdAt' } },
  { collection: 'auth_refresh_tokens', key: { tokenHash: 1 }, options: { unique: true, name: 'auth_refresh_tokenHash' } },
  { collection: 'auth_otps', key: { destination: 1, purpose: 1, consumedAt: 1 }, options: { name: 'auth_otps_lookup' } },
  { collection: 'webhook_events', key: { eventId: 1 }, options: { unique: true, sparse: true, name: 'webhook_events_eventId' } },
  { collection: 'lead_scores', key: { orgId: 1, score: -1 }, options: { name: 'lead_scores_orgId_score' } },
  { collection: 'campaign_executions', key: { orgId: 1, campaignId: 1 }, options: { name: 'campaign_executions_org_campaign' } },
  { collection: 'scanner_results', key: { orgId: 1, jobId: 1 }, options: { name: 'scanner_results_org_job' } },
  { collection: 'business_cards', key: { orgId: 1, id: 1 }, options: { name: 'business_cards_orgId_id' } },
  { collection: 'business_cards', key: { slug: 1 }, options: { unique: true, name: 'business_cards_slug_unique' } },
  { collection: 'business_cards', key: { orgId: 1, updatedAt: -1 }, options: { name: 'business_cards_orgId_updatedAt' } },
  { collection: 'qr_codes', key: { orgId: 1 }, options: { name: 'qr_codes_orgId' } },
  { collection: 'qr_codes', key: { orgId: 1, id: 1 }, options: { name: 'qr_codes_orgId_id' } },
  { collection: 'qr_codes', key: { orgId: 1, type: 1 }, options: { name: 'qr_codes_orgId_type' } },
  { collection: 'qr_codes', key: { orgId: 1, code: 1 }, options: { unique: true, name: 'qr_codes_orgId_code' } },
  { collection: 'qr_codes', key: { orgId: 1, createdAt: -1 }, options: { name: 'qr_codes_orgId_createdAt' } },
  { collection: 'qr_codes', key: { code: 1 }, options: { unique: true, name: 'qr_codes_code_unique' } },
  { collection: 'qr_events', key: { orgId: 1, qrCodeId: 1, createdAt: -1 }, options: { name: 'qr_events_org_qr_createdAt' } },
  { collection: 'qr_events', key: { orgId: 1, eventType: 1, createdAt: -1 }, options: { name: 'qr_events_org_type_createdAt' } },
  { collection: 'qr_conversions', key: { orgId: 1, qrCodeId: 1, createdAt: -1 }, options: { name: 'qr_conversions_org_qr_createdAt' } },
  { collection: 'qr_conversions', key: { orgId: 1, createdAt: -1 }, options: { name: 'qr_conversions_orgId_createdAt' } },
  { collection: 'review_campaigns', key: { orgId: 1, id: 1 }, options: { name: 'review_campaigns_orgId_id' } },
  { collection: 'review_campaigns', key: { orgId: 1, createdAt: -1 }, options: { name: 'review_campaigns_orgId_createdAt' } },
  { collection: 'review_campaigns', key: { orgId: 1, status: 1 }, options: { name: 'review_campaigns_orgId_status' } },
  { collection: 'review_requests', key: { orgId: 1, id: 1 }, options: { name: 'review_requests_orgId_id' } },
  { collection: 'review_requests', key: { orgId: 1, campaignId: 1, createdAt: -1 }, options: { name: 'review_requests_org_campaign_createdAt' } },
  { collection: 'review_requests', key: { token: 1 }, options: { unique: true, name: 'review_requests_token_unique' } },
  { collection: 'review_requests', key: { orgId: 1, createdAt: -1 }, options: { name: 'review_requests_orgId_createdAt' } },
  { collection: 'whatsapp_threads', key: { orgId: 1, id: 1 }, options: { name: 'whatsapp_threads_orgId_id' } },
  { collection: 'whatsapp_threads', key: { orgId: 1, contactPhone: 1 }, options: { unique: true, name: 'whatsapp_threads_org_phone' } },
  { collection: 'whatsapp_threads', key: { orgId: 1, lastMessageAt: -1 }, options: { name: 'whatsapp_threads_org_lastMessage' } },
  { collection: 'whatsapp_messages', key: { orgId: 1, threadId: 1, createdAt: 1 }, options: { name: 'whatsapp_messages_org_thread_created' } },
  { collection: 'retail_stores', key: { orgId: 1, id: 1 }, options: { name: 'retail_stores_orgId_id' } },
  { collection: 'retail_stores', key: { orgId: 1, code: 1 }, options: { unique: true, name: 'retail_stores_org_code' } },
  { collection: 'retail_products', key: { orgId: 1, id: 1 }, options: { name: 'retail_products_orgId_id' } },
  { collection: 'retail_products', key: { orgId: 1, sku: 1 }, options: { unique: true, name: 'retail_products_org_sku' } },
  { collection: 'retail_products', key: { orgId: 1, category: 1 }, options: { name: 'retail_products_org_category' } },
  { collection: 'retail_inventory', key: { orgId: 1, id: 1 }, options: { name: 'retail_inventory_orgId_id' } },
  { collection: 'retail_inventory', key: { orgId: 1, storeId: 1, productId: 1 }, options: { unique: true, name: 'retail_inventory_org_store_product' } },
  { collection: 'retail_inventory', key: { orgId: 1, storeId: 1 }, options: { name: 'retail_inventory_org_store' } },
]

async function applyIndexes(db) {
  let created = 0
  let skipped = 0
  for (const { collection, key, options = {} } of INDEXES) {
    const name = options.name || Object.entries(key).map(([k, v]) => `${k}_${v}`).join('_')
    const existing = await db.collection(collection).indexes()
    if (existing.some((idx) => idx.name === name)) {
      console.log(`  skip  ${collection}.${name}`)
      skipped++
      continue
    }
    await db.collection(collection).createIndex(key, { ...options, background: true })
    console.log(`  ok    ${collection}.${name}`)
    created++
  }
  console.log(`[indexes] ${created} created, ${skipped} skipped`)
}

async function seedCore(db) {
  const now = new Date().toISOString()
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)

  await db.collection('orgs').updateOne(
    { id: DEMO_ORG_ID },
    {
      $set: {
        id: DEMO_ORG_ID,
        name: 'AsoftechInsightz Demo',
        ownerEmail: ADMIN_EMAIL,
        plan: 'growth',
        leadEnabled: true,
        retailEnabled: true,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  )
  console.log('[seed] org demo-org')

  const userId = randomUUID()
  const existingUser = await db.collection('users').findOne({ email: ADMIN_EMAIL })
  const adminId = existingUser?.id || userId

  await db.collection('users').updateOne(
    { email: ADMIN_EMAIL },
    {
      $set: {
        id: adminId,
        orgId: DEMO_ORG_ID,
        email: ADMIN_EMAIL,
        fullName: 'Anoop Kumar',
        name: 'Anoop Kumar',
        passwordHash,
        role: 'admin',
        status: 'active',
        businessSuiteEnabled: true,
        products: ['leadedge360', 'retailedge360'],
        activeProduct: 'leadedge360',
        emailVerified: true,
        phoneVerified: true,
        phone: '+919999999999',
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  )
  console.log(`[seed] admin user ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)

  await db.collection('subscriptions').updateOne(
    { orgId: DEMO_ORG_ID, status: 'ACTIVE' },
    {
      $set: {
        orgId: DEMO_ORG_ID,
        planCode: 'BUSINESS_GROWTH',
        status: 'ACTIVE',
        amount: 49999,
        billingCycle: 'monthly',
        activatedAt: new Date(),
        updatedAt: now,
      },
      $setOnInsert: { id: randomUUID(), createdAt: now },
    },
    { upsert: true },
  )
  console.log('[seed] subscription BUSINESS_GROWTH (includes business_card feature)')

  const cardSlug = 'asoftech-demo'
  const existingCard = await db.collection('business_cards').findOne({ orgId: DEMO_ORG_ID, slug: cardSlug })
  const cardId = existingCard?.id || randomUUID()

  await db.collection('business_cards').updateOne(
    { orgId: DEMO_ORG_ID, slug: cardSlug },
    {
      $set: {
        slug: cardSlug,
        published: true,
        profile: {
          businessName: 'AsoftechInsightz',
          tagline: 'AI-powered growth for SMEs',
          description: 'CRM, marketing automation, and digital business tools.',
          phone: '+919999999999',
          email: ADMIN_EMAIL,
          whatsapp: '+919999999999',
          website: 'https://asoftechinsightz.com',
          address: 'Bengaluru',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
          logoUrl: '/images/brand/asoftechinsightz-logo.png',
          coverUrl: '',
        },
        socialLinks: { google: '', facebook: '', instagram: '', linkedin: '' },
        theme: { primaryColor: '#FF8A3D', layout: 'classic' },
        stats: { views: 0, clicks: 0 },
        updatedAt: now,
        updatedBy: adminId,
      },
      $setOnInsert: {
        id: cardId,
        orgId: DEMO_ORG_ID,
        createdAt: now,
        createdBy: adminId,
      },
    },
    { upsert: true },
  )
  console.log(`[seed] business card slug=${cardSlug} → public URL /c/${cardSlug}`)
}

async function main() {
  console.log(`\n[mongo-bootstrap] ${MONGO_URL} / ${DB_NAME}\n`)

  const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 15000 })
  await client.connect()
  const db = client.db(DB_NAME)

  console.log('--- Indexes ---')
  await applyIndexes(db)

  console.log('\n--- Seed data ---')
  await seedCore(db)

  await client.close()
  console.log('\n[mongo-bootstrap] done\n')
  console.log('Next steps:')
  console.log('  1. Set MONGO_URL and DB_NAME in .env')
  console.log('  2. npm run dev')
  console.log(`  3. Sign in: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
  console.log('  4. Open /growth/business-card or /c/asoftech-demo\n')
}

main().catch((err) => {
  console.error('[mongo-bootstrap] failed:', err.message)
  console.error('\nInstall MongoDB locally, use Docker, or set MONGO_URL to MongoDB Atlas.\n')
  process.exit(1)
})
