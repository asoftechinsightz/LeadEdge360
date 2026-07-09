import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ROLES } from '../lib/billing/roles.js'

function hasRoleAccess(role, permission) {
  const perms = ROLES[role] || []
  if (perms.includes('*')) return true
  return perms.includes(permission)
}

describe('RC2 RBAC (unit)', () => {
  it('SUPER_ADMIN has all permissions', () => {
    assert.equal(hasRoleAccess('SUPER_ADMIN', 'crm'), true)
    assert.equal(hasRoleAccess('SUPER_ADMIN', 'anything'), true)
  })

  it('SALES_EXECUTIVE limited to crm', () => {
    assert.equal(hasRoleAccess('SALES_EXECUTIVE', 'crm'), true)
    assert.equal(hasRoleAccess('SALES_EXECUTIVE', 'invoices'), false)
  })

  it('FINANCE can access invoices', () => {
    assert.equal(hasRoleAccess('FINANCE', 'invoices'), true)
    assert.equal(hasRoleAccess('FINANCE', 'crm'), false)
  })
})
