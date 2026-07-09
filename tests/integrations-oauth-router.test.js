import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getOAuthProvider, isOAuthConfiguredFor } from '../lib/integrations/oauth-router.js'
import { INTEGRATIONS } from '../lib/integrations/registry.js'

describe('Integration OAuth router (unit)', () => {
  it('maps phase 2 integrations to providers', () => {
    assert.equal(getOAuthProvider('google_ads'), 'google')
    assert.equal(getOAuthProvider('facebook_leads'), 'meta')
    assert.equal(getOAuthProvider('instagram'), 'meta')
    assert.equal(getOAuthProvider('google_business'), 'google')
    assert.equal(getOAuthProvider('linkedin'), 'linkedin')
  })

  it('reports 10 implemented integrations', () => {
    const implemented = INTEGRATIONS.filter((i) => i.implemented)
    assert.equal(implemented.length, 10)
  })

  it('isOAuthConfiguredFor returns boolean without throw', () => {
    assert.equal(typeof isOAuthConfiguredFor('google_ads'), 'boolean')
  })
})
