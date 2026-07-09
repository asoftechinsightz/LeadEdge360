'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'

function Shelf({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2.2, 0.08, 0.6]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[2.2, 0.08, 0.6]} />
        <meshStandardMaterial color="#1e3a5f" />
      </mesh>
      {[0.4, 1.0, 1.6].map((x) => (
        <mesh key={x} position={[x - 1, 0.75, 0.15]} scale={0.18}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#FF7A00" emissive="#FF7A00" emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  )
}

function Counter() {
  return (
    <mesh position={[0, 0.4, 1.2]}>
      <boxGeometry args={[1.8, 0.8, 0.9]} />
      <meshStandardMaterial color="#0066FF" metalness={0.3} roughness={0.4} />
    </mesh>
  )
}

function ScanBeam() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) ref.current.position.x = Math.sin(state.clock.elapsedTime * 1.5) * 1.2
  })
  return (
    <mesh ref={ref} position={[0, 1.1, 0.5]}>
      <boxGeometry args={[0.04, 0.5, 0.04]} />
      <meshBasicMaterial color="#00C6FF" transparent opacity={0.8} />
    </mesh>
  )
}

/** Abstract 3D retail floor — billing, shelves, scan. */
export default function RetailStoreSceneInner() {
  return (
    <>
      <color attach="background" args={['#0a1628']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 4, 3]} intensity={1} color="#FF7A00" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <Shelf position={[-1.5, 0, -0.5]} />
      <Shelf position={[1.5, 0, -0.5]} />
      <Counter />
      <ScanBeam />
      <Float speed={1.5} floatIntensity={0.3}>
        <mesh position={[0.8, 1.5, 0.8]} scale={0.15}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial color="#22C55E" emissive="#22C55E" emissiveIntensity={0.4} />
        </mesh>
      </Float>
    </>
  )
}
