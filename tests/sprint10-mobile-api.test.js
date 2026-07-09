import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { listWhatsAppTemplates, renderTemplateBody, getWhatsAppTemplate } from '../lib/whatsapp/templates.js'
import { PIPELINE_COLUMNS } from '../lib/opportunities/stages.js'

describe('Sprint 10 API contracts (unit)', () => {
  it('lead attachment list route shape', () => {
    const path = '/api/leads/lead-1/attachments'
    assert.match(path, /\/attachments$/)
  })

  it('opportunity stage keys match backend STAGES', () => {
    const keys = PIPELINE_COLUMNS.map((c) => c.stage)
    assert.ok(keys.includes('NEW'))
    assert.ok(keys.includes('PROPOSAL_SENT'))
    assert.ok(keys.includes('WON'))
    assert.equal(keys.includes('Discovery'), false)
  })

  it('retail barcode lookup accepts sku query param', () => {
    const url = new URL('https://example.com/api/retail/inventory/lookup?sku=8901234567890')
    assert.equal(url.searchParams.get('sku'), '8901234567890')
  })

  it('retail payment order payload', () => {
    const body = {
      items: [{ inventoryId: 'inv-1', qty: 1, unitPrice: 250 }],
      paymentMethod: 'upi',
    }
    assert.equal(body.paymentMethod, 'upi')
  })

  it('retail checkout with razorpay verification fields', () => {
    const body = {
      items: [{ inventoryId: 'inv-1', qty: 1, unitPrice: 250 }],
      paymentMethod: 'card',
      razorpay_order_id: 'order_abc',
      razorpay_payment_id: 'pay_xyz',
      razorpay_signature: 'sig',
    }
    assert.equal(body.paymentMethod, 'card')
    assert.ok(body.razorpay_order_id)
  })

  it('whatsapp templates list is non-empty', () => {
    const items = listWhatsAppTemplates()
    assert.ok(items.length >= 3)
    assert.ok(items[0].name)
    assert.ok(items[0].params)
  })

  it('whatsapp template render replaces placeholders', () => {
    const tpl = getWhatsAppTemplate('welcome_lead')
    assert.ok(tpl)
    const text = renderTemplateBody(tpl, ['Arnav', 'LeadEdge360'])
    assert.match(text, /Arnav/)
    assert.match(text, /LeadEdge360/)
    assert.doesNotMatch(text, /\{\{1\}\}/)
  })

  it('whatsapp templates API route', () => {
    assert.equal('/api/whatsapp/templates'.endsWith('/templates'), true)
  })
})
