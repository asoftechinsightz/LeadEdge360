/**
 * AI Marketplace foundation — installable agent packages without platform core changes.
 */

import { AGENT_REGISTRY } from '@/lib/agents/registry'
import { SKILL_REGISTRY } from '@/lib/agents/skills/registry'
import { TOOL_REGISTRY } from '@/lib/agents/tools/registry'

/** @typedef {object} AgentPackageManifest
 * @property {string} id
 * @property {string} name
 * @property {string} version
 * @property {string} description
 * @property {string[]} skills
 * @property {string[]} permissions
 * @property {string[]} requiredTools
 * @property {string[]} supportedEvents
 * @property {object} configurationSchema
 */

function buildManifestFromRegistry(agent) {
  return {
    id: agent.id,
    name: agent.name,
    version: '1.0.0',
    description: agent.description,
    role: agent.role,
    skills: agent.capabilities || [],
    permissions: agent.capabilities || [],
    requiredTools: [],
    supportedEvents: agent.subscribedEvents || [],
    configurationSchema: {
      enabled: { type: 'boolean', default: true },
      autoRun: { type: 'boolean', default: agent.autoRun },
      requiresApproval: { type: 'boolean', default: agent.requiresApproval },
      confidenceThreshold: { type: 'number', default: 0.6, min: 0, max: 1 },
      dailyLimit: { type: 'number', default: 100, min: 1 },
    },
    core: true,
    installable: false,
  }
}

export const CORE_AGENT_PACKAGES = AGENT_REGISTRY.map(buildManifestFromRegistry)

export const MARKETPLACE_PACKAGES = [
  ...CORE_AGENT_PACKAGES,
  {
    id: 'compliance-ai',
    name: 'Compliance AI',
    version: '0.1.0',
    description: 'Regulatory compliance checks and audit preparation.',
    role: 'Operations',
    skills: ['compliance_validation', 'risk_analysis', 'document_extraction'],
    permissions: ['read', 'audit'],
    requiredTools: ['knowledge_base', 'document_search'],
    supportedEvents: ['proposal.created', 'document.uploaded'],
    configurationSchema: {
      enabled: { type: 'boolean', default: false },
      autoRun: { type: 'boolean', default: false },
      requiresApproval: { type: 'boolean', default: true },
      confidenceThreshold: { type: 'number', default: 0.85 },
    },
    core: false,
    installable: true,
  },
  {
    id: 'renewal-ai',
    name: 'Renewal AI',
    version: '0.1.0',
    description: 'Automated renewal tracking and outreach.',
    role: 'Support',
    skills: ['customer_segmentation', 'sentiment_analysis'],
    permissions: ['read', 'create'],
    requiredTools: ['customer_lookup', 'email'],
    supportedEvents: ['customer.renewal_due', 'invoice.paid'],
    configurationSchema: {
      enabled: { type: 'boolean', default: false },
      autoRun: { type: 'boolean', default: true },
      requiresApproval: { type: 'boolean', default: false },
      renewalDaysAhead: { type: 'number', default: 30 },
    },
    core: false,
    installable: true,
  },
]

export function listMarketplacePackages() {
  return MARKETPLACE_PACKAGES
}

export function getPackageManifest(packageId) {
  return MARKETPLACE_PACKAGES.find((p) => p.id === packageId) || null
}

export async function getInstalledPackages(db, orgId) {
  const rows = await db.collection('org_agent_packages')
    .find({ orgId, status: 'installed' }, { projection: { _id: 0 } })
    .toArray()
  return rows
}

/** Agent defs for installable marketplace packages (dispatch + handlers). */
export const MARKETPLACE_AGENT_DEFS = {
  'compliance-ai': {
    id: 'compliance-ai',
    name: 'Compliance AI',
    role: 'Operations',
    description: 'Regulatory compliance checks and audit preparation.',
    subscribedEvents: ['proposal.created', 'document.uploaded'],
    capabilities: ['compliance_validation', 'risk_analysis'],
    autoRun: false,
    requiresApproval: true,
  },
  'renewal-ai': {
    id: 'renewal-ai',
    name: 'Renewal AI',
    role: 'Support',
    description: 'Automated renewal tracking and outreach.',
    subscribedEvents: ['customer.renewal_due', 'invoice.paid'],
    capabilities: ['customer_segmentation', 'retention_playbook'],
    autoRun: true,
    requiresApproval: false,
  },
}

export async function getSubscribedAgents(db, orgId, eventType) {
  const { getAgentsForEvent } = await import('@/lib/agents/registry')
  const base = String(eventType || '').replace(/\.v\d+$/, '')
  const core = getAgentsForEvent(eventType)

  const installed = await getInstalledPackages(db, orgId)
  const extras = []
  for (const pkg of installed) {
    const def = MARKETPLACE_AGENT_DEFS[pkg.packageId]
    if (def && def.subscribedEvents.includes(base)) {
      extras.push({
        ...def,
        autoRun: pkg.config?.autoRun ?? def.autoRun,
        requiresApproval: pkg.config?.requiresApproval ?? def.requiresApproval,
      })
    }
  }

  const seen = new Set(core.map((a) => a.id))
  return [...core, ...extras.filter((a) => !seen.has(a.id))]
}

export async function installPackage(db, orgId, packageId, config = {}) {
  const manifest = getPackageManifest(packageId)
  if (!manifest) throw new Error(`Package not found: ${packageId}`)
  if (!manifest.installable && !manifest.core) throw new Error(`Package not installable: ${packageId}`)

  const now = new Date().toISOString()
  const doc = {
    orgId,
    packageId,
    manifest: {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      skills: manifest.skills,
      supportedEvents: manifest.supportedEvents,
    },
    config,
    installedAt: now,
    updatedAt: now,
    status: 'installed',
  }

  await db.collection('org_agent_packages').updateOne(
    { orgId, packageId },
    { $set: doc, $setOnInsert: { createdAt: now } },
    { upsert: true },
  )

  if (!manifest.core) {
    await db.collection('org_ai_settings').updateOne(
      { orgId },
      {
        $set: {
          [`agents.${packageId}`]: {
            enabled: config.enabled ?? true,
            autoRun: config.autoRun ?? manifest.configurationSchema?.autoRun?.default ?? false,
            requiresApproval: config.requiresApproval ?? true,
          },
          updatedAt: now,
        },
        $setOnInsert: { orgId, createdAt: now, enabled: true },
      },
      { upsert: true },
    )
  }

  return doc
}

export async function uninstallPackage(db, orgId, packageId) {
  await db.collection('org_agent_packages').updateOne(
    { orgId, packageId },
    { $set: { status: 'uninstalled', uninstalledAt: new Date().toISOString() } },
  )
  await db.collection('org_ai_settings').updateOne(
    { orgId },
    { $set: { [`agents.${packageId}.enabled`]: false } },
  )
  return { ok: true }
}

export function getMarketplaceCatalog() {
  return {
    packages: MARKETPLACE_PACKAGES,
    skills: Object.values(SKILL_REGISTRY),
    tools: Object.values(TOOL_REGISTRY),
  }
}
