import crypto from 'crypto'
import { normalizeCompany, normalizePhoneDigits, normalizeWebsite } from './validate.js'

export { normalizeCompany, normalizePhoneDigits, normalizeWebsite }

/** Cross-platform unique key — place ID + normalized contacts + company */
export function buildHash(item) {
  return crypto
    .createHash('sha256')
    .update(
      [
        item.placeId || item.id || '',
        normalizeWebsite(item.website),
        normalizePhoneDigits(item.phone),
        normalizeCompany(item.company),
      ].join('|'),
    )
    .digest('hex')
}
