'use client'
import { useEffect, useRef } from 'react'

// A slowly-rotating wireframe sphere drawn via canvas. Smooth, lightweight,
// no three.js dependency. Suitable as hero visual.
export default function WireSphere({ color = '#38BDF8', accent = '#FF8A3D', className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let dpr = Math.min(window.devicePixelRatio || 1, 2), w = 0, h = 0, raf = 0
    const POINTS = 1200
    const pts = []
    for (let i = 0; i < POINTS; i++) {
      const u = Math.random() * 2 - 1
      const t = Math.random() * Math.PI * 2
      const r = Math.sqrt(1 - u * u)
      pts.push({ x: r * Math.cos(t), y: r * Math.sin(t), z: u })
    }

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    let theta = 0, phi = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const cx = w / 2, cy = h / 2
      const R = Math.min(w, h) * 0.42
      theta += 0.0035
      phi += 0.0011
      const cosT = Math.cos(theta), sinT = Math.sin(theta)
      const cosP = Math.cos(phi), sinP = Math.sin(phi)

      // glow
      const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.4)
      g.addColorStop(0, 'rgba(56,189,248,0.18)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      for (const p of pts) {
        // rotate Y then X
        const x1 = p.x * cosT - p.z * sinT
        const z1 = p.x * sinT + p.z * cosT
        const y2 = p.y * cosP - z1 * sinP
        const z2 = p.y * sinP + z1 * cosP
        const persp = 1.6 / (1.8 - z2)
        const sx = cx + x1 * R * persp
        const sy = cy + y2 * R * persp
        const alpha = Math.max(0.15, 0.55 + z2 * 0.55)
        const size = Math.max(0.5, 1.3 * persp)
        // occasional accent particles
        ctx.fillStyle = (p.x + p.y) > 1.2 ? accent : color
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(sx, sy, size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // orbit ring
      ctx.strokeStyle = 'rgba(56,189,248,0.18)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let a = 0; a < Math.PI * 2; a += 0.03) {
        const x = Math.cos(a) * R * 1.05
        const y = Math.sin(a) * R * 0.32
        const yy = y * cosP
        const sx = cx + x
        const sy = cy + yy
        if (a === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy)
      }
      ctx.closePath()
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }
    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [color, accent])

  return <canvas ref={ref} className={`absolute inset-0 ${className}`} />
}
