'use client'

import dynamic from 'next/dynamic'
import SceneCanvas from './SceneCanvas'
import { AuroraFallback } from './fallbacks'

const Inner = dynamic(() => import('./scenes/TrinetraNocSceneInner'), { ssr: false })

export default function TrinetraNocScene({ className }) {
  return (
    <SceneCanvas
      className={className}
      cameraPosition={[0, 2, 7]}
      fov={45}
      fallback={<AuroraFallback className="absolute inset-0" label="Network operations" />}
    >
      <Inner />
    </SceneCanvas>
  )
}
