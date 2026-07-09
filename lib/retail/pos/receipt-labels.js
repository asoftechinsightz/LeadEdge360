/** Receipt PDF labels — English + Hindi (Tier 2/3 India). */
export const RECEIPT_LABELS = {
  en: {
    title: 'GST Bill / Receipt',
    billNo: 'Bill No.',
    date: 'Date',
    gstin: 'GSTIN',
    shop: 'Shop',
    items: 'Items',
    item: 'Item',
    qty: 'Qty',
    rate: 'Rate',
    amount: 'Amount',
    subtotal: 'Subtotal',
    cgst: 'CGST',
    sgst: 'SGST',
    cgstAt: (half) => `CGST @ ${half}%`,
    sgstAt: (half) => `SGST @ ${half}%`,
    total: 'Grand Total',
    payment: 'Payment',
    thankYou: 'Thank you for your purchase!',
  },
  hi: {
    title: 'GST बिल / रसीद',
    billNo: 'बिल नं.',
    date: 'तारीख',
    gstin: 'GSTIN',
    shop: 'दुकान',
    items: 'सामान',
    item: 'वस्तु',
    qty: 'मात्रा',
    rate: 'दर',
    amount: 'राशि',
    subtotal: 'उप-योग',
    cgst: 'CGST',
    sgst: 'SGST',
    cgstAt: (half) => `CGST @ ${half}%`,
    sgstAt: (half) => `SGST @ ${half}%`,
    total: 'कुल राशि',
    payment: 'भुगतान',
    thankYou: 'खरीदारी के लिए धन्यवाद!',
  },
}

export function receiptLabels(language = 'en') {
  return RECEIPT_LABELS[language === 'hi' ? 'hi' : 'en']
}

export function formatInr(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
