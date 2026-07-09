'use client'

import dynamic from 'next/dynamic'
import SceneCanvas from './SceneCanvas'
import { AuroraFallback } from './fallbacks'

const HeroEcosystemSceneInner = dynamic(() => import('./scenes/HeroEcosystemSceneInner'), { ssr: false })

export default function HeroEcosystemScene({ className }) {
  return (
    <SceneCanvas
      className={className}
      cameraPosition={[0, 0.5, 7]}
      fov={50}
      fallback={<AuroraFallback className="absolute inset-0" label="Smart business ecosystem" />}
    >
      <HeroEcosystemSceneInner />
    </SceneCanvas>
  )
}
