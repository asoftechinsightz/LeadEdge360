'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'

const NODES = [
  { pos: [-2.8, 1.2, 0], color: '#FF7A00', scale: 0.35 },
  { pos: [2.6, 0.8, -0.5], color: '#22C55E', scale: 0.32 },
  { pos: [-1.2, -1.4, 0.3], color: '#8B5CF6', scale: 0.38 },
  { pos: [1.8, -1.1, 0.2], color: '#00C6FF', scale: 0.3 },
  { pos: [0, 2.2, -0.8], color: '#0066FF', scale: 0.42 },
]

function HubCore() {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.15
  })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.55, 1]} />
      <meshStandardMaterial color="#0066FF" emissive="#0066FF" emissiveIntensity={0.45} metalness={0.6} roughness={0.2} />
    </mesh>
  )
}

function OrbitNode({ pos, color, scale }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime + pos[0]) * 0.12
  })
  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={ref} position={pos} scale={scale}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
      </mesh>
    </Float>
  )
}

function DataRing() {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.08
  })
  return (
    <mesh ref={ref} rotation={[Math.PI / 2.2, 0, 0]}>
      <torusGeometry args={[3.2, 0.02, 8, 64]} />
      <meshBasicMaterial color="#00C6FF" transparent opacity={0.35} />
    </mesh>
  )
}

/** Cinematic hero — Indian smart-business ecosystem (abstract). */
export default function HeroEcosystemSceneInner() {
  return (
    <>
      <color attach="background" args={['#050d1f']} />
      <fog attach="fog" args={['#050d1f', 8, 18]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[4, 4, 4]} intensity={1.2} color="#00C6FF" />
      <pointLight position={[-4, -2, 2]} intensity={0.8} color="#8B5CF6" />
      <Stars radius={40} depth={30} count={1200} factor={3} saturation={0.2} fade speed={0.4} />
      <DataRing />
      <HubCore />
      {NODES.map((n) => (
        <OrbitNode key={n.color + n.pos[0]} {...n} />
      ))}
    </>
  )
}
