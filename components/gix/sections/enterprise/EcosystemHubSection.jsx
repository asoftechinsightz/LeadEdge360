'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ECOSYSTEM_HUB } from '@/lib/marketing-content'
import { SectionHeader, FadeIn } from '@/components/gix/enterprise/primitives'

/**
 * Canvas network visualization — lightweight alternative to R3F (Phase 2).
 * Respects prefers-reduced-motion.
 */
function EcosystemCanvas({ nodes }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = canvas.getContext('2d')
    let raf
    let t = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const center = () => ({ x: canvas.clientWidth / 2, y: canvas.clientHeight / 2 })
    const positions = nodes.map((_, i) => {
      const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2
      const r = Math.min(canvas.clientWidth, canvas.clientHeight) * 0.32
      return { angle, r }
    })

    const draw = () => {
      const { x: cx, y: cy } = center()
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.5)
      grad.addColorStop(0, 'rgba(0, 102, 255, 0.12)')
      grad.addColorStop(1, 'rgba(5, 13, 31, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      nodes.forEach((node, i) => {
        const pulse = reduced ? 0 : Math.sin(t * 0.02 + i) * 4
        const px = cx + Math.cos(positions[i].angle + (reduced ? 0 : t * 0.003)) * (positions[i].r + pulse)
        const py = cy + Math.sin(positions[i].angle + (reduced ? 0 : t * 0.003)) * (positions[i].r + pulse)

        ctx.strokeStyle = 'rgba(0, 198, 255, 0.25)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(px, py)
        ctx.stroke()

        ctx.fillStyle = node.color
        ctx.beginPath()
        ctx.arc(px, py, 6, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.fillStyle = '#0066FF'
      ctx.beginPath()
      ctx.arc(cx, cy, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('AI', cx, cy + 4)

      if (!reduced) {
        t += 1
        raf = requestAnimationFrame(draw)
      }
    }

    draw()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return () => window.removeEventListener('resize', resize)
    }
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [nodes])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[320px] lg:h-[400px] rounded-2xl border border-border bg-[#050d1f]/80"
      aria-hidden
    />
  )
}

export default function EcosystemHubSection() {
  const { center, nodes } = ECOSYSTEM_HUB

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 gix-aurora opacity-40 pointer-events-none" aria-hidden />
      <div className="container relative">
        <FadeIn>
          <SectionHeader
            eyebrow="Ecosystem"
            title={`${center} connects your entire business`}
            description="Retail operations, revenue growth, and IT observability — unified through AI and real-time analytics."
          />
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-10 items-center mt-12">
          <FadeIn delay={0.05}>
            <EcosystemCanvas nodes={nodes} />
          </FadeIn>
          <div className="grid sm:grid-cols-2 gap-4">
            {nodes.map((node, i) => (
              <FadeIn key={node.id} delay={0.08 + i * 0.04}>
                <Link
                  href={node.href}
                  className="block p-5 rounded-xl border border-border bg-white/80 backdrop-blur-sm hover:border-[hsl(var(--brand-electric))]/40 hover:shadow-lg transition-all"
                >
                  <div className="size-2 rounded-full mb-3" style={{ backgroundColor: node.color }} />
                  <h3 className="font-semibold text-foreground">{node.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{node.desc}</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
