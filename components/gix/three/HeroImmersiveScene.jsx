'use client'

import dynamic from 'next/dynamic'
import SceneCanvas from './SceneCanvas'
import ThreeErrorBoundary from './ThreeErrorBoundary'
import { AuroraFallback } from './fallbacks'

const HeroImmersiveSceneInner = dynamic(() => import('./scenes/HeroImmersiveSceneInner'), { ssr: false })

export default function HeroImmersiveScene({ className }) {
  return (
    <ThreeErrorBoundary className={className}>
      <SceneCanvas
        className={className}
        cameraPosition={[0, 0.35, 7.2]}
        fov={42}
        shadows
        fallback={<AuroraFallback className="absolute inset-0" label="AI device showcase loading" />}
      >
        <HeroImmersiveSceneInner />
      </SceneCanvas>
    </ThreeErrorBoundary>
  )
}
