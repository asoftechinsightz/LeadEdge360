// PostgreSQL connection pool + helpers.
// Activated when DATABASE_URL is set. Reads from /docs/sql canonical schema.
import pg from 'pg'

const connStr = process.env.DATABASE_URL
let pool = null

export function pgEnabled() {
  return !!connStr
}

export function getPgPool() {
  if (!connStr) return null
  if (!pool) {
    pool = new pg.Pool({
      connectionString: connStr,
      max: parseInt(process.env.PG_POOL_MAX || '10'),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    })
    pool.on('error', (e) => console.error('PG pool error', e))
  }
  return pool
}

// Parameterised query helper — always use this, never string-concat SQL.
export async function pgQuery(text, params = []) {
  const p = getPgPool()
  if (!p) throw new Error('PG not configured')
  return p.query(text, params)
}

export async function pgOne(text, params = []) {
  const r = await pgQuery(text, params)
  return r.rows[0] || null
}

export async function pgMany(text, params = []) {
  const r = await pgQuery(text, params)
  return r.rows
}

// Convenience: scoped queries that always include tenant_id filter.
export function scopedQueries(tenantId) {
  return {
    async one(sql, params = []) {
      return pgOne(sql, [tenantId, ...params])
    },
    async many(sql, params = []) {
      return pgMany(sql, [tenantId, ...params])
    },
    async run(sql, params = []) {
      return pgQuery(sql, [tenantId, ...params])
    },
  }
}
