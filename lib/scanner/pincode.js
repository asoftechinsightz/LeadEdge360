const PINCODE_API = 'https://api.postalpincode.in/pincode'

export function normalizeIndianPin(pin) {
  const digits = String(pin || '').replace(/\D/g, '')
  return digits.length === 6 ? digits : ''
}

/**
 * Resolve Indian PIN → city, district, state (India Post data).
 */
export async function resolveIndianPinCode(pin) {
  const pinCode = normalizeIndianPin(pin)
  if (!pinCode) {
    throw new Error('Enter a valid 6-digit PIN code')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 12000)
  let res
  try {
    res = await fetch(`${PINCODE_API}/${pinCode}`, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    throw new Error(`PIN lookup failed (${res.status})`)
  }

  const data = await res.json()
  const block = Array.isArray(data) ? data[0] : data

  if (!block || block.Status !== 'Success' || !block.PostOffice?.length) {
    throw new Error(`PIN code ${pinCode} not found`)
  }

  const offices = block.PostOffice
  const primary = offices.find((o) => o.BranchType === 'Head Post Office')
    || offices.find((o) => o.DeliveryStatus === 'Delivery')
    || offices[0]

  const state = primary.State || ''
  const district = primary.District || ''
  const city = primary.Division || primary.Block || primary.Name || district
  const area = primary.Name || ''

  return {
    pinCode,
    country: 'India',
    state,
    district,
    city,
    area,
    postOffices: offices.length,
  }
}

export function buildPinCentricAddress(pinCode, { country = 'India' } = {}) {
  const pin = normalizeIndianPin(pinCode)
  if (!pin) return ''
  return `${pin}, ${country}`
}
