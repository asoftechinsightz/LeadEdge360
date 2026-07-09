'use client'

import dynamic from 'next/dynamic'
import SceneCanvas from './SceneCanvas'
import { AuroraFallback } from './fallbacks'

const Inner = dynamic(() => import('./scenes/CrmPipelineSceneInner'), { ssr: false })

export default function CrmPipelineScene({ className }) {
  return (
    <SceneCanvas
      className={className}
      cameraPosition={[0, 1, 6]}
      fov={48}
      fallback={<AuroraFallback className="absolute inset-0" label="Sales pipeline" />}
    >
      <Inner />
    </SceneCanvas>
  )
}
