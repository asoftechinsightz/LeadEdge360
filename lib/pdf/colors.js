import { BRAND_COLORS } from '@/lib/brand'

/** pdf-lib rgb() expects 0–1 floats */
export function hexToRgb(hex) {
  const h = String(hex).replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  }
}

export const PDF_BRAND = {
  navy: hexToRgb(BRAND_COLORS.deepNavy),
  blue: hexToRgb(BRAND_COLORS.primaryBlue),
  cyan: hexToRgb(BRAND_COLORS.cyan),
  green: hexToRgb(BRAND_COLORS.leadedgeGreen),
}
