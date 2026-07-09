'use client'

import { Canvas } from '@react-three/fiber'
import { cn } from '@/lib/utils'

export default function R3FCanvas({ children, className, cameraPosition = [0, 0, 8], fov = 45, shadows = false }) {
  return (
    <Canvas
      className={cn('!absolute inset-0', className)}
      dpr={[1, 1.5]}
      shadows={shadows}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: cameraPosition, fov }}
      eventPrefix="client"
    >
      {children}
    </Canvas>
  )
}
