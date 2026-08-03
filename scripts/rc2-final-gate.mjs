/**
 * RC-2 workflow final gate — shared GO/NO-GO with generate-rc2-reports.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { evaluateRc2Gate, reconcileSummary } from './rc2-eval-gate.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const resultsPath = join(root, 'docs', 'releases', 'rc2-artifacts', 'rc2-results.json')

async function main() {
  const data = JSON.parse(await readFile(resultsPath, 'utf8'))
  reconcileSummary(data)
  const gate = evaluateRc2Gate(data)

  await writeFile(resultsPath, JSON.stringify(data, null, 2))

  console.log(`RC-2 gate: ${gate.pass ? 'PASS' : 'FAIL'}`)
  console.log(`RC score: ${gate.scores.rcScore}/100`)
  console.log(
    `Summary: ${data.summary.passedChecks}/${data.summary.totalChecks} (failedChecks=${data.summary.failedChecks})`
  )

  if (!gate.pass) {
    for (const b of gate.blockers) console.error(`BLOCKER: ${b}`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
