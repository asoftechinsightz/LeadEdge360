/**
 * One-time patch: replace resolveTenant with guardCrmRequest / guardProposalRequest.
 * Run: node scripts/harden-api-routes.js
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'app', 'api')
const SKIP_DIRS = new Set(['[[...path]]', 'growth-audit', 'public', 'auth', 'health', 'webhooks'])

const PROPOSAL_PATH_RE = /[/\\]proposals[/\\]/

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      if (!SKIP_DIRS.has(ent.name) && !ent.name.startsWith('public')) walk(p, files)
    } else if (ent.name === 'route.js') files.push(p)
  }
  return files
}

function patch(file) {
  let s = fs.readFileSync(file, 'utf8')
  if (!s.includes('resolveTenant')) return false

  const isProposal = PROPOSAL_PATH_RE.test(file.replace(/\\/g, '/'))
  const guardImport = isProposal
    ? "import { guardProposalRequest, crmError } from '@/lib/api/route-guards'"
    : "import { guardCrmRequest, crmError } from '@/lib/api/route-guards'"
  const guardFn = isProposal ? 'guardProposalRequest' : 'guardCrmRequest'

  s = s.replace(/import \{ resolveTenant \} from '@\/lib\/tenant'\n?/g, '')
  s = s.replace(/import \{ resolveTenant, ensureUserOrg \} from '@\/lib\/tenant'\n?/g, '')
  if (!s.includes("from '@/lib/api/route-guards'")) {
    const importBlock = s.match(/^import[\s\S]*?(?=\nexport|\nconst |\nfunction |\n\/\*\*)/)
    if (importBlock) {
      s = s.replace(importBlock[0], importBlock[0] + guardImport + '\n')
    } else {
      s = guardImport + '\n' + s
    }
  }

  if (isProposal) {
    s = s.replace(/const PROPOSAL_PLANS = \[[^\]]+\]\n\n?/g, '')
    s = s.replace(/\s*await requirePlan\(orgId, PROPOSAL_PLANS\)\n?/g, '\n')
    s = s.replace(/import \{ requirePlan \} from '@\/lib\/billing\/require-plan'\n?/g, '')
  }

  s = s.replace(
    /const tenant\s*=\s*\n?\s*await resolveTenant\((req|request)\)/g,
    `const { orgId } = await ${guardFn}($1)`,
  )
  s = s.replace(
    /const \{ orgId(, user)? \} = await resolveTenant\((req|request)\)/g,
    `const { orgId$1 } = await ${guardFn}($2)`,
  )
  s = s.replace(/await resolveTenant\((req|request)\)/g, `await ${guardFn}($1)`)
  s = s.replace(/tenant\.orgId/g, 'orgId')

  fs.writeFileSync(file, s)
  return true
}

let n = 0
for (const file of walk(ROOT)) {
  if (patch(file)) {
    n++
    console.log('patched', path.relative(ROOT, file))
  }
}
console.log('done:', n, 'files')
