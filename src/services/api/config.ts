/**

 * When true, enterprise modules use mock adapters.

 * UAT/production default to live HTTP unless NEXT_PUBLIC_USE_MOCK_API=true.

 */

function resolveUseMockApi(): boolean {

  const flag = process.env.NEXT_PUBLIC_USE_MOCK_API

  if (flag === 'false') return false

  if (flag === 'true') return true

  const env = String(process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || '').toLowerCase()

  if (env === 'uat' || env === 'staging' || env === 'production' || env === 'prod') return false

  return true

}



export const USE_MOCK_API = resolveUseMockApi();



export const API_DELAY_MS = Number(process.env.NEXT_PUBLIC_MOCK_API_DELAY_MS || 280);

