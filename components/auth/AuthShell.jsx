'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { cn } from '@/lib/utils'

/**
 * Premium auth layout — glass card on dark aurora background.
 */
export default function AuthShell({
  children,
  title,
  subtitle,
  sideTitle,
  sideSubtitle,
  sideBullets = [],
  footer,
  className,
}) {
  return (
    <div className={cn('relative min-h-screen overflow-hidden bg-[#030712] text-white', className)}>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-violet-600/10 blur-[90px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between border-r border-white/5 bg-gradient-to-br from-[#0a1628]/90 to-[#050a1f]/95 p-12 xl:p-16">
          <div>
            <BrandLogo href="/" variant="sidebar" className="mb-16" />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-400/90 mb-4">AsoftechInsightz</p>
              <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
                {sideTitle || 'Enterprise-grade workspace access'}
              </h1>
              <p className="mt-5 text-lg text-slate-300/90 leading-relaxed max-w-md">
                {sideSubtitle || 'Sign in to RetailEdge360, LeadEdge360, and your unified Business Suite workspace.'}
              </p>
            </motion.div>
            {sideBullets.length > 0 && (
              <ul className="mt-10 space-y-4">
                {sideBullets.map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-300"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                  >
                    <span className="size-1.5 rounded-full bg-cyan-400" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
          <p className="text-xs text-slate-500">
            By continuing you agree to our{' '}
            <Link href="/terms" className="text-cyan-400 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>.
          </p>
        </aside>

        <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-md lg:max-w-lg">
            <BrandLogo href="/" variant="compact" className="mb-8 lg:hidden" />
            <motion.div
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {(title || subtitle) && (
                <div className="mb-8">
                  {title && <h2 className="font-display text-2xl font-bold">{title}</h2>}
                  {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
                </div>
              )}
              {children}
            </motion.div>
            {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  )
}
