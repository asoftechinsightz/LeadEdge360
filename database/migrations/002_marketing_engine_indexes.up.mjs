import { spawnSync } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

export async function up(_db, { dryRun = false } = {}) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
  const r = spawnSync(process.execPath, ['scripts/marketing-engine-indexes.mjs'], { cwd: root, stdio: 'inherit' })
  if (r.status !== 0) throw new Error('002_marketing_engine_indexes up failed')
}
