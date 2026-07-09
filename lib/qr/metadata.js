function parseDeviceType(ua = '') {
  const s = ua.toLowerCase()
  if (/tablet|ipad|playbook|silk/i.test(s)) return 'tablet'
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(s)) return 'mobile'
  if (/android/i.test(s)) return 'tablet'
  return 'desktop'
}

function parseBrowser(ua = '') {
  const s = ua.toLowerCase()
  if (s.includes('edg/')) return 'edge'
  if (s.includes('chrome/') && !s.includes('edg/')) return 'chrome'
  if (s.includes('firefox/')) return 'firefox'
  if (s.includes('safari/') && !s.includes('chrome/')) return 'safari'
  if (s.includes('opr/') || s.includes('opera')) return 'opera'
  return 'other'
}

export function parseRequestMetadata(req) {
  const ua = req.headers.get('user-agent') || ''
  const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '')
    .split(',')[0]
    .trim()

  return {
    ip,
    ua,
    userAgent: ua,
    referer: req.headers.get('referer') || '',
    country: req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || '',
    city: req.headers.get('x-vercel-ip-city') || '',
    deviceType: parseDeviceType(ua),
    browser: parseBrowser(ua),
  }
}

export function visitorKey(metadata = {}) {
  const ip = metadata.ip || 'unknown'
  const ua = (metadata.ua || metadata.userAgent || '').slice(0, 80)
  return `${ip}:${ua}`
}
