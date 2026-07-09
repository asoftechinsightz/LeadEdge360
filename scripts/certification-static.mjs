#!/usr/bin/env node
/**
 * Static go-live certification — validates codebase artifacts without MongoDB.
 * Usage: node scripts/certification-static.mjs
 */
import { existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const results = []

function record(category, name, pass, detail = '') {
  results.push({ category, name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${category}] ${name}${detail ? ` — ${detail}` : ''}`)
  if (!pass) process.exitCode = 1
}

function fileExists(rel) {
  return existsSync(resolve(root, rel))
}

function main() {
  console.log('\n=== STATIC GO-LIVE CERTIFICATION ===\n')

  // Architecture
  const coreModules = [
    'lib/events/bus.js',
    'lib/events/processors.js',
    'lib/events/replay.js',
    'lib/events/dlq.js',
    'lib/agents/registry.js',
    'lib/agents/dispatch.js',
    'lib/agents/executor.js',
    'lib/agents/org-config.js',
    'lib/agents/approval.js',
    'lib/agents/memory.js',
    'lib/agents/tools/executor.js',
    'lib/agents/skills/registry.js',
    'lib/agents/marketplace/manifest.js',
    'lib/agents/disaster-recovery.js',
    'scripts/mongo-connect-env.mjs',
    'lib/integrations/n8n.js',
    'lib/activities/service.js',
  ]
  for (const m of coreModules) record('Architecture', m, fileExists(m))

  // APIs
  const apis = [
    'app/api/agents/route.js',
    'app/api/agents/settings/route.js',
    'app/api/agents/analytics/route.js',
    'app/api/agents/observability/route.js',
    'app/api/agents/recovery/route.js',
    'app/api/agents/scheduled/run/route.js',
    'app/api/platform/events/replay/route.js',
    'app/api/platform/health/route.js',
    'app/api/health/live/route.js',
    'app/api/health/ready/route.js',
  ]
  for (const a of apis) record('API', a, fileExists(a))

  // UI
  const ui = [
    'components/ops/AgentRuntimeDashboard.js',
    'components/ops/AIWorkforceAnalytics.js',
    'components/ops/AIOpsCommandCenter.js',
    'components/settings/AIWorkforceSettings.js',
    'app/ops/agents/page.js',
    'app/ops/ai-analytics/page.js',
  ]
  for (const u of ui) record('UI', u, fileExists(u))

  // Docs
  const docs = [
    'docs/platform/EVENT_PLATFORM.md',
    'docs/platform/AGENT_RUNTIME.md',
    'docs/platform/AGENT_RUNTIME_1B.md',
    'docs/platform/AGENT_RUNTIME_1C.md',
    'docs/platform/PRODUCTION_READINESS_REPORT.md',
    'docs/platform/GO_LIVE_CERTIFICATION_REPORT.md',
    'docs/platform/OPERATIONS_RUNBOOK.md',
    'docs/platform/PILOT_READINESS.md',
    'docs/platform/RUNTIME_CERTIFICATION_REPORT.md',
  ]
  for (const d of docs) record('Docs', d, fileExists(d))

  // 12 agents in registry
  const registry = readFileSync(resolve(root, 'lib/agents/registry.js'), 'utf8')
  const agentCount = (registry.match(/id: '/g) || []).length
  record('AI Workforce', '12 agents in registry', agentCount >= 12, `count=${agentCount}`)

  // Event types
  const types = readFileSync(resolve(root, 'lib/events/types.js'), 'utf8')
  const requiredEvents = [
    'lead.created', 'lead.qualified', 'opportunity.created', 'proposal.created',
    'proposal.won', 'invoice.paid', 'payment.received', 'agent.task.completed',
    'customer.onboarded', 'meeting.scheduled', 'customer.renewal_due',
  ]
  for (const ev of requiredEvents) {
    record('Events', `${ev} defined`, types.includes(`'${ev}'`), '')
  }

  // Retest scripts
  const scripts = [
    'scripts/go-live-retest.mjs',
    'scripts/agent-runtime-retest.mjs',
    'scripts/certification-e2e-workflow.mjs',
    'scripts/runtime-vps-certification.mjs',
    'scripts/vps-runtime-certification.sh',
    'scripts/tenant-isolation-retest.mjs',
    'scripts/foundation-retest.mjs',
    'scripts/mongo-indexes.mjs',
  ]
  for (const s of scripts) record('Automation', s, fileExists(s))

  // Build
  try {
    execSync('npm run build', { cwd: root, stdio: 'pipe', timeout: 300000 })
    record('Build', 'npm run build', true)
  } catch (e) {
    record('Build', 'npm run build', false, e.message?.slice(0, 80))
  }

  // Security - production mode check exists
  record('Security', 'production.js guards', fileExists('lib/security/production.js'))
  record('Security', 'platform-guard.js', fileExists('lib/api/platform-guard.js'))

  const passed = results.filter((r) => r.pass).length
  const score = Math.round((passed / results.length) * 100)
  console.log(`\n=== STATIC CERTIFICATION: ${passed}/${results.length} (${score}%) ===\n`)

  if (score >= 95) {
    console.log('STATIC: CERTIFIED — run runtime scripts when MongoDB + API are available.\n')
  } else {
    console.log('STATIC: GAPS FOUND — resolve failures before go-live.\n')
  }
}

main()
