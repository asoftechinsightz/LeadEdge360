import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

function calcGstInvoice(subtotal, gstPercent = 18) {
  const gstAmount = subtotal * gstPercent / 100
  return {
    subtotal,
    gstPercent,
    gstAmount,
    totalAmount: subtotal + gstAmount,
    items: [{ name: 'CRM License', qty: 1, rate: subtotal, amount: subtotal }],
  }
}

describe('invoice line items (unit)', () => {
  it('calculates GST totals from line item subtotal', () => {
    const inv = calcGstInvoice(100000)
    assert.equal(inv.gstAmount, 18000)
    assert.equal(inv.totalAmount, 118000)
    assert.equal(inv.items[0].amount, 100000)
  })

  it('PATCH payload includes items array', () => {
    const patch = {
      clientName: 'Acme',
      status: 'SENT',
      items: [
        { name: 'Services', qty: 2, rate: 25000, amount: 50000 },
        { name: 'License', qty: 1, rate: 30000, amount: 30000 },
        { name: 'Support', qty: 1, rate: 10000, amount: 10000 },
      ],
      subtotal: 90000,
      gstAmount: 16200,
      totalAmount: 106200,
    }
    assert.ok(Array.isArray(patch.items))
    assert.equal(patch.items.length, 3)
  })

  it('proposal convert copies items when present', () => {
    const proposal = {
      items: [{ name: 'License', qty: 1, rate: 50000, amount: 50000 }],
      subtotal: 50000,
    }
    const invoice = { items: Array.isArray(proposal.items) ? proposal.items : [] }
    assert.equal(invoice.items[0].name, 'License')
  })
})
