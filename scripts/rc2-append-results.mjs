/**
 * Append CI job outcomes to rc2-results.json (RC-2 workflow helper).
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { reconcileSummary } from './rc2-eval-gate.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const resultsPath = join(root, 'docs', 'releases', 'rc2-artifacts', 'rc2-results.json')

async function main() {
  const data = JSON.parse(await readFile(resultsPath, 'utf8'))
  const args = new Set(process.argv.slice(2))

  if (args.has('--build-ok')) data.build = { ok: true }
  if (args.has('--build-fail')) data.build = { ok: false }
  if (args.has('--docker-ok')) data.docker = { ok: true }
  if (args.has('--docker-fail')) data.docker = { ok: false }
  if (args.has('--api-ok')) data.apiRegression = { ok: true }
  if (args.has('--api-fail')) data.apiRegression = { ok: false }

  reconcileSummary(data)

  await writeFile(resultsPath, JSON.stringify(data, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
