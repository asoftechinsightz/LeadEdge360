/**
 * Centralized MongoDB connection configuration for LeadEdge360.
 *
 * Used by runtime/certification scripts. The Next.js app continues to use
 * lib/mongo.js with MONGO_URL from Docker Compose unchanged.
 *
 * Execution modes:
 *   - docker  → hostname `mongo` (Docker Compose service)
 *   - host    → hostname `127.0.0.1` (VPS/local host scripts)
 *   - override → MONGO_HOST_OVERRIDE
 *
 * Env:
 *   MONGO_URL, DB_NAME, MONGO_USERNAME, MONGO_PASSWORD
 *   MONGO_HOST_OVERRIDE — optional explicit hostname
 */
import { existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { MongoClient } from 'mongodb'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const defaultProjectRoot = resolve(__dirname, '..')

const DOCKER_SERVICE_HOST = 'mongo'
const HOST_LOOPBACK = '127.0.0.1'

/** @typedef {'docker' | 'host' | 'override'} MongoExecutionMode */

/**
 * Detect whether the current process runs inside a Docker container.
 * @returns {{ mode: MongoExecutionMode, host: string, inDocker: boolean }}
 */
export function detectExecutionMode(env = process.env) {
  const override = String(env.MONGO_HOST_OVERRIDE || '').trim()
  if (override) {
    return { mode: 'override', host: override, inDocker: false }
  }

  const inDocker =
    existsSync('/.dockerenv') ||
    env.DOCKER_CONTAINER === '1' ||
    env.RUNNING_IN_DOCKER === 'true'

  return {
    mode: inDocker ? 'docker' : 'host',
    host: inDocker ? DOCKER_SERVICE_HOST : HOST_LOOPBACK,
    inDocker,
  }
}

/**
 * Load `.env` without overwriting variables already set in the environment.
 * @param {string} [projectRoot]
 */
export function loadEnvForScripts(projectRoot = defaultProjectRoot) {
  const envPath = resolve(projectRoot, '.env')
  if (!existsSync(envPath)) return
  const raw = readFileSync(envPath, 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (!m) continue
    const key = m[1].trim()
    const val = m[2].trim().replace(/^["']|["']$/g, '')
    if (process.env[key] == null || process.env[key] === '') {
      process.env[key] = val
    }
  }
}

/** Expand ${VAR} placeholders using env. */
export function expandEnvTemplates(value, env = process.env) {
  if (!value) return value
  return String(value).replace(/\$\{([A-Z0-9_]+)\}/g, (_, key) => env[key] ?? '')
}

/**
 * Extract hostname from a MongoDB connection string.
 * @param {string} mongoUrl
 */
export function extractMongoHostname(mongoUrl) {
  if (!mongoUrl) return ''
  if (mongoUrl.startsWith('mongodb+srv://')) {
    const m = mongoUrl.match(/mongodb\+srv:\/\/(?:[^@]+@)?([^/?]+)/i)
    return m?.[1]?.split(':')[0] || ''
  }
  const m = mongoUrl.match(/mongodb(?:\+srv)?:\/\/(?:[^@]+@)?([^:/]+)/i)
  return m?.[1] || ''
}

/**
 * Replace the hostname in a MongoDB URI (not applied to mongodb+srv Atlas URLs).
 * @param {string} mongoUrl
 * @param {string} host
 */
export function rewriteMongoHostname(mongoUrl, host) {
  if (!mongoUrl || !host || mongoUrl.startsWith('mongodb+srv://')) return mongoUrl
  return mongoUrl
    .replace(/(@)([^:/@]+)(:)/g, (full, at, hostname, colon) => {
      if (hostname.includes(',')) return full
      return `${at}${host}${colon}`
    })
    .replace(/mongodb:\/\/([^:/@]+):/i, `mongodb://${host}:`)
}

/**
 * Resolve database name with template expansion and safe fallback.
 * @param {NodeJS.ProcessEnv} env
 */
export function resolveDbName(env = process.env) {
  let dbName = expandEnvTemplates(env.DB_NAME, env)?.trim() || 'asoftech_saas'
  if (!dbName || dbName.includes('${')) dbName = 'asoftech_saas'
  return dbName
}

/**
 * Build MongoDB URI from discrete credentials (preferred for host-side scripts).
 * @param {NodeJS.ProcessEnv} env
 * @param {string} host
 */
export function buildMongoUrlFromCredentials(env, host) {
  const user = expandEnvTemplates(env.MONGO_USERNAME, env)?.trim()
  const pass = expandEnvTemplates(env.MONGO_PASSWORD, env)?.trim()
  if (!user || !pass) return null
  return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:27017/?authSource=admin`
}

/**
 * Resolve target MongoDB hostname for the current execution context.
 * @param {NodeJS.ProcessEnv} env
 */
export function resolveMongoTargetHost(env = process.env) {
  const execution = detectExecutionMode(env)
  let targetHost = execution.host

  const rawUrl = expandEnvTemplates(env.MONGO_URL, env)?.trim() || ''
  const sourceHost = extractMongoHostname(rawUrl)

  if (execution.inDocker && (sourceHost === HOST_LOOPBACK || sourceHost === 'localhost')) {
    targetHost = DOCKER_SERVICE_HOST
  }
  if (!execution.inDocker && sourceHost === DOCKER_SERVICE_HOST) {
    targetHost = HOST_LOOPBACK
  }
  if (execution.mode === 'override') {
    targetHost = execution.host
  }

  return { execution, targetHost, sourceHost, rawUrl }
}

/**
 * Build the effective MongoDB URL for the current execution context.
 * @param {NodeJS.ProcessEnv} [env]
 */
export function getMongoConnectConfig(env = process.env) {
  const dbName = resolveDbName(env)
  const { execution, targetHost, sourceHost, rawUrl } = resolveMongoTargetHost(env)

  // Prefer MONGO_USERNAME + MONGO_PASSWORD — matches Docker Compose init and avoids stale MONGO_URL templates
  let mongoUrl = buildMongoUrlFromCredentials(env, targetHost)
  let credentialSource = mongoUrl ? 'username_password' : 'mongo_url'

  if (!mongoUrl) {
    mongoUrl = rawUrl || ''
    if (!mongoUrl && env.MONGO_USERNAME && env.MONGO_PASSWORD) {
      mongoUrl = buildMongoUrlFromCredentials(env, targetHost)
      credentialSource = 'username_password'
    }
    if (!mongoUrl) {
      mongoUrl = `mongodb://${targetHost}:27017`
      credentialSource = 'default'
    }
    if (!mongoUrl.startsWith('mongodb+srv://') && sourceHost && sourceHost !== targetHost) {
      mongoUrl = rewriteMongoHostname(mongoUrl, targetHost)
    }
  }

  return {
    mongoUrl,
    dbName,
    executionMode: execution.mode,
    inDocker: execution.inDocker,
    expectedHost: targetHost,
    sourceHost: sourceHost || extractMongoHostname(mongoUrl),
    sourceUrl: rawUrl || mongoUrl,
    credentialSource,
  }
}

/** @deprecated alias */
export const resolveMongoConnectEnv = getMongoConnectConfig

/** @deprecated alias */
export const loadEnvFile = loadEnvForScripts

/**
 * Mask password in MongoDB URI for logs.
 * @param {string} mongoUrl
 */
export function maskMongoUrl(mongoUrl) {
  return String(mongoUrl || '').replace(/:([^:@/]+)@/, ':****@')
}

/**
 * Human-readable connection failure guidance.
 * @param {object} config
 * @param {Error} error
 */
export function formatMongoConnectionError(config, error) {
  const lines = [
    '',
    'MongoDB connection failed.',
    '',
    `Detected execution mode: ${config.inDocker ? 'docker' : 'host'}`,
    `Expected Mongo host: ${config.expectedHost}`,
    `Current Mongo host (from URL): ${config.sourceHost || '(unknown)'}`,
    `Resolved Mongo URL host: ${extractMongoHostname(config.mongoUrl)}`,
    '',
    `Error: ${error.message}`,
    '',
  ]

  if (!config.inDocker && config.sourceHost === DOCKER_SERVICE_HOST) {
    lines.push(
      'MongoDB host cannot be resolved from the VPS host.',
      'Docker Compose service names (e.g. "mongo") are only reachable inside containers.',
      'This tooling rewrites "mongo" → "127.0.0.1" automatically on the host.',
      '',
    )
  }

  lines.push(
    'Fixes:',
    '  • Ensure MongoDB container is running: docker compose up -d mongo',
    '  • Optional override: export MONGO_HOST_OVERRIDE=127.0.0.1',
    '  • Verify MONGO_USERNAME / MONGO_PASSWORD / DB_NAME in .env',
  )

  if (/authentication failed/i.test(error.message)) {
    lines.push(
      '  • Auth test: docker exec asoftech-mongo mongosh admin -u "$MONGO_USERNAME" -p "$MONGO_PASSWORD" --eval "db.runCommand({ping:1})"',
      '  • MONGO_URL in .env may be stale — host scripts prefer MONGO_USERNAME + MONGO_PASSWORD',
    )
  }

  lines.push('')

  return lines.join('\n')
}

/**
 * Validate MongoDB connectivity (ping + list collections).
 * @param {object} [options]
 * @param {number} [options.timeoutMs]
 * @param {NodeJS.ProcessEnv} [options.env]
 */
export async function validateMongoConnection(options = {}) {
  const { timeoutMs = 20000, env = process.env } = options
  loadEnvForScripts()
  const config = getMongoConnectConfig(env)

  if (!config.mongoUrl || config.mongoUrl.includes('REPLACE_') || config.mongoUrl.includes('PASTE_YOUR_ATLAS')) {
    throw new Error('MONGO_URL is not configured. Set MONGO_URL in .env or export it in the environment.')
  }

  const client = new MongoClient(config.mongoUrl, { serverSelectionTimeoutMS: timeoutMs })
  try {
    await client.connect()
    const db = client.db(config.dbName)
    const ping = await db.command({ ping: 1 })
    const collections = await db.listCollections().toArray()
    return {
      ok: ping.ok === 1,
      ...config,
      collections: collections.length,
    }
  } catch (error) {
    const message = formatMongoConnectionError(config, error)
    const err = new Error(message)
    err.config = config
    err.cause = error
    throw err
  } finally {
    await client.close().catch(() => {})
  }
}

/**
 * Connect a MongoClient using resolved runtime configuration.
 * @param {object} [options]
 */
export async function connectMongoClient(options = {}) {
  const { timeoutMs = 20000, env = process.env, validate = false } = options
  loadEnvForScripts()
  const config = getMongoConnectConfig(env)

  if (validate) {
    await validateMongoConnection({ timeoutMs, env })
  }

  const client = new MongoClient(config.mongoUrl, { serverSelectionTimeoutMS: timeoutMs })
  await client.connect()
  return { client, db: client.db(config.dbName), config }
}

/**
 * Shell exports for bash scripts.
 * Usage: eval "$(node scripts/mongo-connect-env.mjs --shell)"
 */
export function printShellExports(env = process.env) {
  loadEnvForScripts()
  const config = getMongoConnectConfig(env)
  const esc = (s) => `'${String(s).replace(/'/g, `'\"'\"'`)}'`
  console.log(`export MONGO_URL=${esc(config.mongoUrl)}`)
  console.log(`export DB_NAME=${esc(config.dbName)}`)
  console.log(`export MONGO_EXECUTION_MODE=${esc(config.executionMode)}`)
  console.log(`export MONGO_EXPECTED_HOST=${esc(config.expectedHost)}`)
}

// CLI: node lib/mongo-connect.js --validate | --shell
const isMain = process.argv[1] && resolve(process.argv[1]) === __filename
if (isMain) {
  loadEnvForScripts()
  if (process.argv.includes('--shell')) {
    printShellExports()
  } else if (process.argv.includes('--validate')) {
    validateMongoConnection()
      .then((r) => {
        console.log(`[mongo-connect] OK — ${maskMongoUrl(r.mongoUrl)} / ${r.dbName}`)
        console.log(`[mongo-connect] mode=${r.executionMode} host=${r.expectedHost} collections=${r.collections}`)
      })
      .catch((e) => {
        console.error(e.message)
        process.exit(1)
      })
  } else {
    const c = getMongoConnectConfig()
    console.log(JSON.stringify({ ...c, mongoUrl: maskMongoUrl(c.mongoUrl) }, null, 2))
  }
}
