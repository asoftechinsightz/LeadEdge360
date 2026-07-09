'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function ServerRack({ x, z }) {
  const ledRef = useRef()
  useFrame((state) => {
    if (!ledRef.current) return
    const blink = Math.sin(state.clock.elapsedTime * 4 + x) > 0.6 ? 0.9 : 0.15
    ledRef.current.material.emissiveIntensity = blink
  })
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[0.7, 1.5, 0.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh ref={ledRef} position={[0, 1.1, 0.26]}>
        <boxGeometry args={[0.5, 0.08, 0.02]} />
        <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

function AlertPulse() {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.2
    ref.current.scale.set(s, s, s)
    ref.current.material.opacity = 0.25 + Math.sin(state.clock.elapsedTime * 2) * 0.15
  })
  return (
    <mesh ref={ref} position={[0, 2.2, 0]}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshBasicMaterial color="#f59e0b" transparent opacity={0.3} />
    </mesh>
  )
}

/** Futuristic NOC — servers, alerts, topology. */
export default function TrinetraNocSceneInner() {
  return (
    <>
      <color attach="background" args={['#030712']} />
      <fog attach="fog" args={['#030712', 6, 14]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[0, 4, 2]} intensity={1} color="#8B5CF6" />
      <pointLight position={[-3, 1, 3]} intensity={0.6} color="#00C6FF" />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {[-2, -0.7, 0.7, 2].map((x) => (
        <ServerRack key={x} x={x} z={0} />
      ))}
      <AlertPulse />
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.25, 32]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.4} />
      </mesh>
    </>
  )
}
