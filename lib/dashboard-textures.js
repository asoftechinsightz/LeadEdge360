import * as THREE from 'three'

const THEMES = {
  leadedge360: {
    title: 'LeadEdge360',
    subtitle: 'CRM · Pipeline · AI Scoring',
    accent: '#0066FF',
    bg: '#071428',
    panel: '#0f2744',
  },
  retailedge360: {
    title: 'RetailEdge360',
    subtitle: 'POS · GST · Inventory',
    accent: '#F97316',
    bg: '#1a1008',
    panel: '#2a1810',
  },
  trinetra360: {
    title: 'Trinetra360',
    subtitle: 'APM · Logs · AIOps',
    accent: '#8B5CF6',
    bg: '#12082a',
    panel: '#1e1040',
  },
}

function drawBar(ctx, x, y, w, h, color) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

/** Procedural dashboard texture — no external image files required (safe for WebGL). */
export function createDashboardTexture(productId = 'leadedge360') {
  const theme = THEMES[productId] || THEMES.leadedge360
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 640
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  grad.addColorStop(0, theme.bg)
  grad.addColorStop(1, '#030712')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = theme.panel
  ctx.fillRect(32, 32, 960, 576)

  ctx.fillStyle = theme.accent
  ctx.globalAlpha = 0.15
  ctx.fillRect(32, 32, 960, 72)
  ctx.globalAlpha = 1

  ctx.fillStyle = '#e2e8f0'
  ctx.font = 'bold 36px system-ui, sans-serif'
  ctx.fillText(theme.title, 56, 82)
  ctx.fillStyle = '#94a3b8'
  ctx.font = '22px system-ui, sans-serif'
  ctx.fillText(theme.subtitle, 56, 118)

  const bars = [0.55, 0.72, 0.48, 0.85, 0.62, 0.78]
  bars.forEach((h, i) => {
    drawBar(ctx, 72 + i * 88, 420 - h * 200, 56, h * 200, `${theme.accent}99`)
  })

  ctx.strokeStyle = `${theme.accent}66`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(72, 380)
  bars.forEach((h, i) => {
    ctx.lineTo(72 + i * 88 + 28, 380 - h * 180)
  })
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.needsUpdate = true
  return texture
}

export function resolveProductIdFromSrc(src, fallback = 'leadedge360') {
  if (!src) return fallback
  if (src.includes('retail')) return 'retailedge360'
  if (src.includes('trinetra')) return 'trinetra360'
  if (src.includes('lead')) return 'leadedge360'
  return fallback
}
