'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const DEVICE_STYLES = {
  laptop: {
    frame: 'rounded-[1.25rem] border border-white/15 bg-gradient-to-b from-slate-800/90 to-slate-950/95 p-2.5 shadow-2xl shadow-blue-950/50',
    screen: 'rounded-xl overflow-hidden border border-white/10 bg-[#050a1f]',
    notch: 'hidden',
    aspect: 'aspect-[16/10]',
  },
  tablet: {
    frame: 'rounded-[1.75rem] border border-white/15 bg-gradient-to-b from-slate-800/80 to-slate-900/95 p-3 shadow-xl shadow-cyan-950/40 max-w-md mx-auto',
    screen: 'rounded-2xl overflow-hidden border border-white/10 bg-[#050a1f]',
    notch: 'mx-auto mb-2 h-1 w-16 rounded-full bg-white/20',
    aspect: 'aspect-[4/3]',
  },
  mobile: {
    frame: 'rounded-[2rem] border border-white/15 bg-gradient-to-b from-slate-800/80 to-slate-900/95 p-2 shadow-xl shadow-blue-950/40 max-w-[220px] mx-auto',
    screen: 'rounded-[1.5rem] overflow-hidden border border-white/10 bg-[#050a1f]',
    notch: 'mx-auto mb-1.5 h-4 w-20 rounded-full bg-black/60 border border-white/10',
    aspect: 'aspect-[9/19]',
  },
}

/**
 * Premium floating device frame for real product screenshots.
 */
export function DeviceMockup({
  src,
  alt,
  device = 'laptop',
  className,
  float = true,
  glow = 'cyan',
  priority = false,
  sizes = '(max-width: 768px) 100vw, 1200px',
}) {
  const style = DEVICE_STYLES[device] || DEVICE_STYLES.laptop
  const glowClass =
    glow === 'violet'
      ? 'from-violet-500/20 via-transparent to-blue-500/10'
      : glow === 'orange'
        ? 'from-orange-500/20 via-transparent to-cyan-500/10'
        : 'from-cyan-500/20 via-transparent to-blue-500/10'

  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ opacity: 0, y: float ? 28 : 0 }}
      whileInView={{ opacity: 1, y: float ? undefined : 0 }}
      viewport={{ once: true, margin: '-40px' }}
      animate={float ? { opacity: 1, y: [0, -8, 0] } : { opacity: 1, y: 0 }}
      transition={
        float
          ? {
              opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
            }
          : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <div
        className={cn(
          'pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br opacity-70 blur-3xl',
          glowClass,
        )}
        aria-hidden
      />
      <div className={cn('relative gix-glass backdrop-blur-xl', style.frame)}>
        {style.notch !== 'hidden' && <div className={style.notch} aria-hidden />}
        <div className={cn(style.screen, style.aspect, 'relative')}>
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover object-top"
            sizes={sizes}
            priority={priority}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050a1f]/40 via-transparent to-white/5" />
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Multi-device showcase — laptop hero + tablet/mobile accents.
 */
export function DeviceShowcase({ src, alt, className, glow = 'cyan' }) {
  return (
    <div className={cn('relative', className)}>
      <DeviceMockup src={src} alt={alt} device="laptop" glow={glow} priority className="relative z-10" />
      <div className="hidden lg:block absolute -right-4 top-16 z-20 w-[28%] -rotate-6 scale-90 opacity-95">
        <DeviceMockup src={src} alt={`${alt} — tablet view`} device="tablet" glow={glow} float={false} />
      </div>
      <div className="hidden lg:block absolute -left-2 bottom-4 z-20 w-[14%] rotate-6 scale-95 opacity-90">
        <DeviceMockup src={src} alt={`${alt} — mobile view`} device="mobile" glow={glow} float={false} />
      </div>
    </div>
  )
}

export default DeviceMockup
