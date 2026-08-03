import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const ARTIFACT_DIR = join(root, 'docs', 'releases', 'rc2-artifacts')

export async function ensureArtifactDir() {
  await mkdir(ARTIFACT_DIR, { recursive: true })
}

export async function writeJson(name, data) {
  await ensureArtifactDir()
  const path = join(ARTIFACT_DIR, name)
  await writeFile(path, JSON.stringify(data, null, 2), 'utf8')
  return path
}

export function makeSuite(name) {
  const checks = []
  return {
    name,
    checks,
    assert(label, ok) {
      checks.push({ label, ok: !!ok })
      return !!ok
    },
    summary() {
      const passed = checks.filter((c) => c.ok).length
      const total = checks.length
      return { name, passed, total, failed: total - passed, checks }
    },
  }
}
