/**
 * Forward: core CRM + auth indexes (idempotent).
 * Source: scripts/mongo-indexes.mjs
 */
import { spawnSync } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

export async function up(db, { dryRun = false } = {}) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
  const args = ['scripts/mongo-indexes.mjs']
  if (dryRun) args.push('--dry-run')
  const r = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' })
  if (r.status !== 0) throw new Error('001_core_indexes up failed')
}
