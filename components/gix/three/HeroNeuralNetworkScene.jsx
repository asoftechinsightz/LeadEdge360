'use client'

import dynamic from 'next/dynamic'
import SceneCanvas from './SceneCanvas'
import { AuroraFallback } from './fallbacks'

const HeroNeuralNetworkSceneInner = dynamic(() => import('./scenes/HeroNeuralNetworkSceneInner'), { ssr: false })

export default function HeroNeuralNetworkScene({ className }) {
  return (
    <SceneCanvas
      className={className}
      cameraPosition={[0, 0.2, 6.5]}
      fov={48}
      fallback={<AuroraFallback className="absolute inset-0" label="AI intelligence network" />}
    >
      <HeroNeuralNetworkSceneInner />
    </SceneCanvas>
  )
}
