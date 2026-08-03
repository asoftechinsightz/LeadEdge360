/**
 * RC-06 — Lightweight performance benchmarks (no product changes).
 */
import { performance } from 'node:perf_hooks'
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MongoClient } from 'mongodb'
import { v4 as uuid } from 'uuid'
import { checkEntitlement } from '../../lib/billing/plan-entitlements.js'
import { resolveAuthDispatch } from '../../lib/request-actor.js'
import { mergeUserPreferences } from '../../lib/aeo/preferences-merge.js'
import { makeSuite } from './report.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

export async function runPerformance(db) {
  const suite = makeSuite('performance')

  const t0 = performance.now()
  const aeoRun = spawnSync('npm', ['run', 'test:aeo'], {
    cwd: root,
    env: process.env,
    shell: true,
    encoding: 'utf8',
  })
  const computeMs = performance.now() - t0
  suite.assert('aeo test suite pass', aeoRun.status === 0)

  const t1 = performance.now()
  for (let i = 0; i < 10000; i++) {
    resolveAuthDispatch({ root: 'followups', hasBearer: false, bridgeEnabled: true })
  }
  const dispatchMs = performance.now() - t1
  suite.assert('bridge dispatch 10000x < 50ms', dispatchMs < 50)

  const t2 = performance.now()
  for (let i = 0; i < 200; i++) {
    mergeUserPreferences({ notifications: { push: true } }, { aeoProfile: { businessName: `B${i}` } })
  }
  const mergeMs = performance.now() - t2
  suite.assert('preferences merge 200x < 200ms', mergeMs < 200)

  process.env.ENFORCE_PLAN_LIMITS = 'true'
  const orgId = uuid()
  await db.collection('orgs').insertOne({
    id: orgId,
    name: 'Perf Org',
    plan: 'starter',
    leadEnabled: true,
    retailEnabled: false,
    createdAt: new Date().toISOString(),
  })

  const t3 = performance.now()
  for (let i = 0; i < 50; i++) await checkEntitlement(db, orgId, 'lead.create')
  const entMs = performance.now() - t3
  suite.assert('entitlement check 50x < 3000ms', entMs < 3000)
  process.env.ENFORCE_PLAN_LIMITS = 'false'

  return {
    ...suite.summary(),
    metrics: {
      aeoCompute500Ms: Math.round(computeMs),
      dispatch10000Ms: Math.round(dispatchMs),
      merge200Ms: Math.round(mergeMs),
      entitlement50Ms: Math.round(entMs),
    },
  }
}

export async function runPerformanceWithMongo(uri, dbName) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 })
  await client.connect()
  try {
    return await runPerformance(client.db(dbName))
  } finally {
    await client.close()
  }
}
