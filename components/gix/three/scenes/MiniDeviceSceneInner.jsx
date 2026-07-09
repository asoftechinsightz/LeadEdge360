'use client'

import { MiniRotatingScreen } from '../devices/DeviceMeshes'

export default function MiniDeviceSceneInner({ productId, textureSrc, device, accent }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={0.8} color={accent || '#8B5CF6'} />
      <pointLight position={[-2, -1, 1]} intensity={0.4} color="#00C6FF" />
      <MiniRotatingScreen productId={productId} textureSrc={textureSrc} device={device} rotSpeed={0.45} />
    </>
  )
}
