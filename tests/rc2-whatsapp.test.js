import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { listWhatsAppTemplates, renderTemplateBody, getWhatsAppTemplate } from '../lib/whatsapp/templates.js'

describe('RC2 WhatsApp templates (unit)', () => {
  it('lists templates with params', () => {
    const items = listWhatsAppTemplates()
    assert.ok(items.length >= 4)
    for (const t of items) {
      assert.ok(t.name)
      assert.ok(Array.isArray(t.params))
    }
  })

  it('renders all placeholders', () => {
    const tpl = getWhatsAppTemplate('follow_up')
    const text = renderTemplateBody(tpl, ['Sam', 'CRM demo'])
    assert.doesNotMatch(text, /\{\{\d+\}\}/)
  })

  it('rejects unknown template name at service layer contract', () => {
    assert.equal(getWhatsAppTemplate('missing'), null)
  })
})
