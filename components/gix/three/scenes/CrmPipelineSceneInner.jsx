'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'

const STAGES = [
  { label: 'Lead', color: '#0066FF', x: -3 },
  { label: 'CRM', color: '#00C6FF', x: -1 },
  { label: 'Proposal', color: '#8B5CF6', x: 1 },
  { label: 'Customer', color: '#22C55E', x: 3 },
]

function StageNode({ x, color, phase }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const pulse = 0.85 + Math.sin(state.clock.elapsedTime * 2.5 + phase) * 0.15
    ref.current.scale.setScalar(pulse)
    ref.current.material.emissiveIntensity = 0.2 + Math.max(0, Math.sin(state.clock.elapsedTime * 2 + phase)) * 0.45
  })
  return (
    <mesh ref={ref} position={[x, 0, 0]}>
      <sphereGeometry args={[0.35, 20, 20]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  )
}

/** Animated CRM pipeline — lead → customer. */
export default function CrmPipelineSceneInner() {
  const points = useMemo(
    () => STAGES.map((s) => [s.x, 0, 0]),
    [],
  )

  return (
    <>
      <color attach="background" args={['#050d1f']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 4]} intensity={1.2} color="#0066FF" />
      <Line points={points} color="#00C6FF" lineWidth={1} transparent opacity={0.5} />
      {STAGES.map((s, i) => (
        <StageNode key={s.label} x={s.x} color={s.color} phase={i * 1.2} />
      ))}
    </>
  )
}
