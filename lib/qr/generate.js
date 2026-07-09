import { publicScanUrl } from './service'

/**
 * External QR image URL (no native deps). Encodes the public /q/{code} scan link.
 */
export function qrImageUrl(code, size = 300) {
  const target = publicScanUrl(code)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(target)}`
}

export function qrSvgImageUrl(code, size = 300) {
  const target = publicScanUrl(code)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=svg&data=${encodeURIComponent(target)}`
}
