/**
 * Runtime environment identification for Demo / UAT / Production.
 * Set NEXT_PUBLIC_APP_ENV=demo|uat|production (or APP_ENV server-side).
 */

export function getRuntimeEnvironment() {
  const explicit = process.env.NEXT_PUBLIC_APP_ENV || process.env.APP_ENV || ''
  const normalized = String(explicit).toLowerCase().trim()
  if (normalized === 'demo') return 'demo'
  if (normalized === 'uat' || normalized === 'staging') return 'uat'
  if (normalized === 'production' || normalized === 'prod') return 'production'
  if (process.env.NODE_ENV === 'production') return 'production'
  return 'development'
}

export function getEnvironmentBadge() {
  const env = getRuntimeEnvironment()
  const map = {
    demo: { label: 'DEMO', className: 'bg-orange-500 text-white' },
    uat: { label: 'UAT', className: 'bg-blue-600 text-white' },
    production: { label: 'PRODUCTION', className: 'bg-emerald-600 text-white' },
    development: { label: 'DEV', className: 'bg-slate-600 text-white' },
  }
  return map[env] || map.development
}

export function isDemoEnvironment() {
  return getRuntimeEnvironment() === 'demo'
}

export function isProductionEnvironment() {
  return getRuntimeEnvironment() === 'production'
}

/**
 * Enterprise modules use mock adapters in development/demo only.
 * UAT and production default to live HTTP adapters unless explicitly overridden.
 */
export function shouldUseMockApi() {
  const flag = process.env.NEXT_PUBLIC_USE_MOCK_API
  if (flag === 'false') return false
  if (flag === 'true') return true
  const env = getRuntimeEnvironment()
  return env === 'development' || env === 'demo'
}
