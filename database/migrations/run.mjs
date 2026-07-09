#!/usr/bin/env node
/**
 * MongoDB migration runner — idempotent forward/rollback.
 * Usage: node database/migrations/run.mjs up|down [--dry-run]
 */
import { MongoClient } from 'mongodb'
import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { loadEnvForScripts, getMongoConnectConfig, maskMongoUrl } from '../../lib/mongo-connect.js'

const dir = dirname(fileURLToPath(import.meta.url))
const direction = process.argv[2] || 'up'
const dryRun = process.argv.includes('--dry-run')

loadEnvForScripts()
const { mongoUrl, dbName } = getMongoConnectConfig()

function listMigrations(suffix) {
  return readdirSync(dir)
    .filter((f) => f.endsWith(`.${suffix}.mjs`))
    .sort()
}

async function main() {
  const client = new MongoClient(mongoUrl)
  await client.connect()
  const db = client.db(dbName)
  const log = db.collection('_migrations')

  const files = direction === 'down'
    ? listMigrations('down').reverse()
    : listMigrations('up')

  console.log(`[migrations] ${direction} on ${maskMongoUrl(mongoUrl)}/${dbName} (${files.length} files)`)

  for (const file of files) {
    const id = file.replace(/\.(up|down)\.mjs$/, '')
    if (direction === 'up') {
      const applied = await log.findOne({ id, direction: 'up' })
      if (applied) {
        console.log(`  skip ${id} (already applied)`)
        continue
      }
    }

    const mod = await import(pathToFileURL(join(dir, file)).href)
    const fn = direction === 'up' ? mod.up : mod.down
    if (typeof fn !== 'function') {
      console.warn(`  skip ${file} — no ${direction}()`)
      continue
    }

    console.log(`  ${dryRun ? 'dry-run' : 'apply'} ${file}`)
    if (!dryRun) {
      await fn(db, { dryRun: false })
      if (direction === 'up') {
        await log.updateOne(
          { id },
          { $set: { id, direction: 'up', appliedAt: new Date().toISOString(), file } },
          { upsert: true },
        )
      } else {
        await log.deleteOne({ id: id.replace(/\.down$/, '') })
      }
    }
  }

  await client.close()
  console.log('[migrations] done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
