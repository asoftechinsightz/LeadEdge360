'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Stars, Line } from '@react-three/drei'
import * as THREE from 'three'

const ORBIT_LABELS = [
  { pos: [-2.4, 1.1, 0.2], color: '#22C55E', label: 'operations' },
  { pos: [2.5, 0.6, -0.3], color: '#0066FF', label: 'customers' },
  { pos: [-1.5, -1.2, 0.4], color: '#00C6FF', label: 'revenue' },
  { pos: [1.6, -1.0, 0.1], color: '#8B5CF6', label: 'observe' },
  { pos: [0, 2.0, -0.6], color: '#FF7A00', label: 'intelligence' },
]

function AISphere() {
  const ref = useRef()
  const wire = useRef()
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.12
    if (wire.current) wire.current.rotation.y -= dt * 0.08
  })
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.7, 2]} />
        <meshStandardMaterial
          color="#0066FF"
          emissive="#00C6FF"
          emissiveIntensity={0.55}
          metalness={0.7}
          roughness={0.15}
          wireframe={false}
        />
      </mesh>
      <mesh ref={wire} scale={1.15}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial color="#00C6FF" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

function OrbitNode({ pos, color }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * 0.8 + pos[0]) * 0.1
  })
  return (
    <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.35}>
      <mesh ref={ref} position={pos}>
        <sphereGeometry args={[0.18, 20, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </Float>
  )
}

function DataLines() {
  const points = useMemo(() => {
    const center = new THREE.Vector3(0, 0, 0)
    return ORBIT_LABELS.map((n) => [center, new THREE.Vector3(...n.pos)])
  }, [])
  return (
    <group>
      {points.map((pair, i) => (
        <Line
          key={ORBIT_LABELS[i].label}
          points={pair}
          color="#00C6FF"
          lineWidth={1}
          transparent
          opacity={0.25}
        />
      ))}
    </group>
  )
}

function PlatformRing() {
  const ref = useRef()
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.05
  })
  return (
    <group rotation={[Math.PI / 2.15, 0, 0]} position={[0, -1.8, 0]}>
      <mesh ref={ref}>
        <torusGeometry args={[3.4, 0.04, 16, 80]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.45} />
      </mesh>
      <mesh>
        <torusGeometry args={[3.8, 0.015, 8, 80]} />
        <meshBasicMaterial color="#00C6FF" transparent opacity={0.2} />
      </mesh>
    </group>
  )
}

/** Cinematic AI neural network — original, inspired by premium SaaS heroes. */
export default function HeroNeuralNetworkSceneInner() {
  return (
    <>
      <color attach="background" args={['#030712']} />
      <fog attach="fog" args={['#030712', 6, 16]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[5, 4, 4]} intensity={1.4} color="#00C6FF" />
      <pointLight position={[-4, -1, 3]} intensity={0.9} color="#8B5CF6" />
      <spotLight position={[0, 6, 2]} intensity={0.6} color="#0066FF" angle={0.5} penumbra={1} />
      <Stars radius={50} depth={40} count={2000} factor={2.5} saturation={0.15} fade speed={0.3} />
      <PlatformRing />
      <DataLines />
      <AISphere />
      {ORBIT_LABELS.map((n) => (
        <OrbitNode key={n.label} pos={n.pos} color={n.color} />
      ))}
    </>
  )
}
