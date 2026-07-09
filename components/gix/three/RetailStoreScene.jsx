'use client'

import dynamic from 'next/dynamic'
import SceneCanvas from './SceneCanvas'
import { AuroraFallback } from './fallbacks'

const Inner = dynamic(() => import('./scenes/RetailStoreSceneInner'), { ssr: false })

export default function RetailStoreScene({ className }) {
  return (
    <SceneCanvas
      className={className}
      cameraPosition={[3, 2.5, 5]}
      fov={42}
      fallback={<AuroraFallback className="absolute inset-0" label="Retail intelligence" />}
    >
      <Inner />
    </SceneCanvas>
  )
}
