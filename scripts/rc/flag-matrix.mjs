/**
 * RC-03 — Feature flag combination validation (no HTTP).
 */
import { resolveAuthDispatch } from '../../lib/request-actor.js'
import { isPlanEnforcementEnabled } from '../../lib/billing/plan-entitlements.js'
import { makeSuite } from './report.mjs'

function isAeoServerProfileEnabled() {
  return process.env.AEO_SERVER_PROFILE === 'true'
}

const COMBOS = [
  { id: '1', enforce: false, bridge: false, aeo: false },
  { id: '2', enforce: true, bridge: false, aeo: false },
  { id: '3', enforce: true, bridge: true, aeo: false },
  { id: '4', enforce: true, bridge: true, aeo: true },
]

export async function runFlagMatrix() {
  const suite = makeSuite('feature-flag-matrix')
  const prev = {
    ENFORCE_PLAN_LIMITS: process.env.ENFORCE_PLAN_LIMITS,
    WEB_JWT_BRIDGE: process.env.WEB_JWT_BRIDGE,
    AEO_SERVER_PROFILE: process.env.AEO_SERVER_PROFILE,
  }

  for (const c of COMBOS) {
    process.env.ENFORCE_PLAN_LIMITS = c.enforce ? 'true' : 'false'
    process.env.WEB_JWT_BRIDGE = c.bridge ? 'true' : 'false'
    process.env.AEO_SERVER_PROFILE = c.aeo ? 'true' : 'false'

    const label = `combo ${c.id} E=${c.enforce} B=${c.bridge} A=${c.aeo}`
    const enforceOn = isPlanEnforcementEnabled()
    const bridgeOn = process.env.WEB_JWT_BRIDGE === 'true'
    const aeoOn = isAeoServerProfileEnabled()

    suite.assert(`${label} enforce flag`, enforceOn === c.enforce)
    suite.assert(`${label} bridge flag`, bridgeOn === c.bridge)
    suite.assert(`${label} aeo flag`, aeoOn === c.aeo)

    const followupsOff = resolveAuthDispatch({
      root: 'followups',
      hasBearer: false,
      bridgeEnabled: bridgeOn,
    })
    suite.assert(
      `${label} followups cookie dispatch`,
      c.bridge ? followupsOff === 'bridge' : followupsOff === 'bridge_disabled_404'
    )

    const leadsLegacy = resolveAuthDispatch({
      root: 'leads',
      hasBearer: false,
      bridgeEnabled: bridgeOn,
    })
    suite.assert(`${label} leads legacy`, leadsLegacy === 'legacy')

    const jwtFirst = resolveAuthDispatch({
      root: 'followups',
      hasBearer: true,
      bridgeEnabled: bridgeOn,
    })
    suite.assert(`${label} jwt first`, jwtFirst === 'jwt')
  }

  process.env.ENFORCE_PLAN_LIMITS = prev.ENFORCE_PLAN_LIMITS
  process.env.WEB_JWT_BRIDGE = prev.WEB_JWT_BRIDGE
  process.env.AEO_SERVER_PROFILE = prev.AEO_SERVER_PROFILE

  return suite.summary()
}
