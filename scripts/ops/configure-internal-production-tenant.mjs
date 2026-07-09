#!/usr/bin/env node
/**
 * Configure AsoftechInsightz as the internal production tenant.
 * - Subscription enforcement bypass (operations never blocked by expiry)
 * - orgType=internal_production, demo=false
 * - ENTERPRISE subscription record kept for reporting (status may be EXPIRED in DB — still bypasses)
 *
 * Usage (VPS):
 *   source .env
 *   node scripts/ops/configure-internal-production-tenant.mjs
 *   node scripts/ops/configure-internal-production-tenant.mjs --dry-run
 */
import { randomUUID } from 'crypto'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { MongoClient } from 'mongodb'
import { loadEnvForScripts, getMongoConnectConfig } from '../../lib/mongo-connect.js'
import {
  INTERNAL_PRODUCTION_ORG_ID,
  ORG_TYPES,
} from '../../lib/billing/tenant-policy.js'

loadEnvForScripts()

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const dryRun = process.argv.includes('--dry-run')
const orgId = process.env.INTERNAL_PRODUCTION_ORG_ID || INTERNAL_PRODUCTION_ORG_ID
const adminEmail = process.env.INTERNAL_ADMIN_EMAIL
  || process.env.CERT_ADMIN_EMAIL
  || 'admin@asoftechinsightz.com'

async function main() {
  const { mongoUrl, dbName } = getMongoConnectConfig()
  const now = new Date().toISOString()
  const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 15000 })
  await client.connect()
  const db = client.db(dbName)

  const report = {
    generatedAt: now,
    orgId,
    dryRun,
    checks: [],
  }

  try {
    const org = await db.collection('orgs').findOne({ id: orgId })
    if (!org) {
      throw new Error(`Org ${orgId} not found — run pilot:align-org or pilot-onboard first`)
    }

    const orgUpdate = {
      name: org.name || 'AsoftechInsightz',
      orgType: ORG_TYPES.INTERNAL_PRODUCTION,
      internalProduction: true,
      subscriptionEnforcement: 'none',
      demo: false,
      pilot: false,
      leadEnabled: true,
      retailEnabled: true,
      businessSuiteEnabled: true,
      multiTenant: true,
      productionReady: true,
      updatedAt: now,
    }

    if (dryRun) {
      console.log('[dry-run] org update', orgUpdate)
    } else {
      await db.collection('orgs').updateOne({ id: orgId }, { $set: orgUpdate })
      console.log(`[org] ${orgId} → internal_production`)
    }
    report.checks.push({ name: 'org_type', pass: true, detail: ORG_TYPES.INTERNAL_PRODUCTION })

    const subDoc = {
      id: `sub-${orgId}`,
      orgId,
      planCode: 'ENTERPRISE',
      status: 'ACTIVE',
      amount: 0,
      billingCycle: 'monthly',
      internalProduction: true,
      reportingOnly: true,
      activatedAt: new Date(),
      updatedAt: now,
    }
    if (dryRun) {
      console.log('[dry-run] subscription', subDoc)
    } else {
      await db.collection('subscriptions').updateOne(
        { orgId },
        { $set: subDoc, $setOnInsert: { createdAt: now } },
        { upsert: true },
      )
      console.log('[subscription] ENTERPRISE reporting record (enforcement bypass active)')
    }
    report.checks.push({ name: 'subscription_record', pass: true })

    const admin = await db.collection('users').findOne({ email: adminEmail })
    if (admin) {
      const userUpdate = {
        businessSuiteEnabled: true,
        products: ['leadedge360', 'retailedge360'],
        updatedAt: now,
      }
      if (!dryRun) {
        await db.collection('users').updateOne({ email: adminEmail }, { $set: userUpdate })
      }
      report.checks.push({ name: 'admin_user', pass: true, detail: adminEmail })
    } else {
      report.checks.push({ name: 'admin_user', pass: false, detail: `${adminEmail} not found` })
    }

    const demoLeadCount = await db.collection('leads').countDocuments({
      orgId,
      $or: [
        { id: { $regex: /^demo-lead-/ } },
        { demo: true },
        { source: 'demo_seed' },
      ],
    })
    const demoOk = demoLeadCount === 0
    report.checks.push({
      name: 'no_demo_leads_in_production',
      pass: demoOk,
      detail: demoLeadCount ? `${demoLeadCount} demo leads found — remove before go-live` : 'clean',
      critical: false,
    })
    if (!demoOk) {
      console.warn(`WARN: ${demoLeadCount} demo/sample leads in ${orgId} — use real data only`)
    }

    const outDir = join(root, 'docs', 'deployments')
    mkdirSync(outDir, { recursive: true })
    const outPath = join(outDir, 'internal-production-tenant-config.json')
    if (!dryRun) writeFileSync(outPath, JSON.stringify(report, null, 2))

    console.log('\n=== Internal production tenant configured ===')
    console.log(`  orgId: ${orgId}`)
    console.log(`  admin: ${adminEmail}`)
    console.log(`  subscription enforcement: BYPASSED`)
    console.log(`  customer tenants: STANDARD enforcement`)
    if (!dryRun) console.log(`  report: ${outPath}`)
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error('[configure-internal-production] failed:', err.message)
  process.exit(1)
})
