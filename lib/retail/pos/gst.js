/** Retail POS GST — default 5% (2.5% CGST + 2.5% SGST) for intra-state kirana billing. */
export function calcRetailGst(subtotal, gstRate = 5) {
  const base = Math.max(0, Number(subtotal) || 0)
  const rate = Number(gstRate) || 5
  const gstAmount = Math.round((base * rate / 100) * 100) / 100
  const half = Math.round((gstAmount / 2) * 100) / 100
  return {
    subtotal: base,
    gstRate: rate,
    cgst: half,
    sgst: half,
    gstAmount,
    totalAmount: Math.round((base + gstAmount) * 100) / 100,
  }
}
