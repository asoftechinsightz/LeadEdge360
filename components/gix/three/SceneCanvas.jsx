'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { useReducedMotion3d } from './useReducedMotion3d'
import { AuroraFallback } from './fallbacks'

const R3FCanvas = dynamic(() => import('./R3FCanvas'), { ssr: false })

/**
 * Lazy WebGL wrapper — children are R3F scene contents (inside Canvas).
 * @param {object} props
 * @param {React.ReactNode} props.children — scene graph
 * @param {string} [props.className]
 * @param {React.ReactNode} [props.fallback]
 * @param {string} [props.cameraPosition='0,0,8']
 */
export default function SceneCanvas({
  children,
  className,
  fallback,
  cameraPosition = [0, 0, 8],
  fov = 45,
  shadows = false,
}) {
  const reduced = useReducedMotion3d()

  if (reduced) {
    return fallback ?? <AuroraFallback className={className} />
  }

  return (
    <div className={cn('relative', className)}>
      <Suspense fallback={fallback ?? <AuroraFallback className="absolute inset-0" />}>
        <R3FCanvas cameraPosition={cameraPosition} fov={fov} shadows={shadows} className="absolute inset-0">
          {children}
        </R3FCanvas>
      </Suspense>
    </div>
  )
}
