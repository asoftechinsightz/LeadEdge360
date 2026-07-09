'use client'

import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

const DARK_SECTION = 'text-white [&_p]:text-slate-400'
const DARK_EYEBROW = 'text-violet-400'

export function SectionHeader({ eyebrow, title, description, align = 'center', className = '', dark = true }) {
  const alignClass = align === 'left' ? 'text-left' : 'text-center mx-auto'
  return (
    <div className={cn('max-w-3xl mb-14', alignClass, dark && DARK_SECTION, className)}>
      {eyebrow && (
        <p className={cn('text-xs font-semibold uppercase tracking-[0.2em] mb-3', dark ? DARK_EYEBROW : 'text-[hsl(var(--brand-electric))]')}>
          {eyebrow}
        </p>
      )}
      <h2 className={cn('font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight', dark ? 'text-white' : 'text-foreground')}>
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg leading-relaxed">{description}</p>
      )}
    </div>
  )
}

export function GlassCard({ children, className = '', glow = false }) {
  return (
    <div
      className={cn(
        'gix-glass-dark rounded-2xl border border-white/10 backdrop-blur-xl text-white',
        glow && 'gix-glow',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const [transform, setTransform] = useState('perspective(900px) rotateX(0deg) rotateY(0deg)')

  const onMove = (e) => {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTransform(`perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale3d(1.02,1.02,1.02)`)
  }

  const onLeave = () => setTransform('perspective(900px) rotateX(0deg) rotateY(0deg)')

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transform, transition: 'transform 0.35s ease' }}
      className={cn('gix-glass-dark gix-float rounded-2xl border border-white/10 p-6 text-white', className)}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({ children, delay = 0, className = '', priority = false }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>

  const transition = { duration: priority ? 0.5 : 0.65, ease: [0.22, 1, 0.36, 1], delay }

  if (priority) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}
