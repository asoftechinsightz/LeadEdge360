'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { useReducedMotion3d } from './useReducedMotion3d'

const MiniDeviceSceneInner = dynamic(() => import('./scenes/MiniDeviceSceneInner'), { ssr: false })
const R3FCanvas = dynamic(() => import('./R3FCanvas'), { ssr: false })

export default function MiniDeviceCanvas({ productId, textureSrc, device = 'laptop', className, accent = '#8B5CF6' }) {
  const reduced = useReducedMotion3d()

  if (reduced) {
    return (
      <div
        className={cn('rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center', className)}
        style={{ minHeight: 140 }}
        aria-hidden
      >
        <div className="size-16 rounded-full opacity-30" style={{ background: `radial-gradient(circle, ${accent}40, transparent)` }} />
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-xl overflow-hidden border border-white/10 bg-[#050a18]', className)} style={{ minHeight: 140 }}>
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 80%, ${accent}30, transparent 70%)` }}
      />
      <R3FCanvas cameraPosition={[0, 0, 2.8]} fov={40} className="!relative h-[140px]">
        <MiniDeviceSceneInner productId={productId} textureSrc={textureSrc} device={device} accent={accent} />
      </R3FCanvas>
    </div>
  )
}
