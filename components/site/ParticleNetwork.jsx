'use client'
import { useEffect, useRef } from 'react'

// Lightweight, GPU-friendly particle + connection network for hero backgrounds.
// Inspired by clean enterprise-tech hero animations (marmasec-style).
export default function ParticleNetwork({
  density = 70,
  color = '#FF8A3D',
  accentColor = '#22C55E',
  linkColor = 'rgba(255,138,61,0.18)',
  speed = 0.35,
  className = '',
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2)
    let mouse = { x: -9999, y: -9999 }
    let particles = []

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(density, Math.floor((w * h) / 14000))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: Math.random() * 1.6 + 0.6,
        accent: Math.random() < 0.18,
      }))
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      // subtle radial glow
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, Math.max(w, h) * 0.6)
      grad.addColorStop(0, 'rgba(255,138,61,0.05)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1

        const dx = p.x - mouse.x, dy = p.y - mouse.y
        const distM = Math.sqrt(dx*dx + dy*dy)
        if (distM < 120) {
          p.x += (dx / distM) * 0.4
          p.y += (dy / distM) * 0.4
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.accent ? accentColor : color
        ctx.globalAlpha = 0.85
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.sqrt(dx*dx + dy*dy)
          if (d < 130) {
            ctx.strokeStyle = linkColor
            ctx.lineWidth = 1
            ctx.globalAlpha = 1 - d / 130
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseleave', onLeave)
    }
  }, [density, color, accentColor, linkColor, speed])

  return <canvas ref={canvasRef} className={`absolute inset-0 ${className}`} />
}
