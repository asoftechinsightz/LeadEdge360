'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Float,
  Stars,
  Line,
  Sparkles,
  ContactShadows,
  Environment,
  Html,
} from '@react-three/drei'
import * as THREE from 'three'
import { RotatingLaptop, RotatingTablet, RotatingPhone } from '../devices/DeviceMeshes'
import { useDeviceTier } from '../useDeviceTier'

const ORBIT_NODES = [
  { pos: [-2.8, 1.4, 0.1], color: '#22C55E', label: 'Manage Operations' },
  { pos: [2.9, 1.0, -0.2], color: '#0066FF', label: 'Acquire Customers' },
  { pos: [-2.0, -0.8, 0.5], color: '#00C6FF', label: 'Scale Revenue' },
  { pos: [2.2, -0.6, 0.3], color: '#8B5CF6', label: 'Business Intelligence' },
]

function AISphere() {
  const core = useRef()
  const wire = useRef()
  const ring = useRef()

  useFrame((_, dt) => {
    if (core.current) core.current.rotation.y += dt * 0.1
    if (wire.current) wire.current.rotation.y -= dt * 0.14
    if (ring.current) ring.current.rotation.z += dt * 0.06
  })

  return (
    <group position={[0, 1.6, -1.8]}>
      <Float speed={1.2} floatIntensity={0.4}>
        <mesh ref={core}>
          <icosahedronGeometry args={[0.65, 2]} />
          <meshStandardMaterial
            color="#0066FF"
            emissive="#00C6FF"
            emissiveIntensity={0.65}
            metalness={0.8}
            roughness={0.12}
          />
        </mesh>
        <mesh ref={wire} scale={1.2}>
          <icosahedronGeometry args={[0.65, 1]} />
          <meshBasicMaterial color="#00C6FF" wireframe transparent opacity={0.4} />
        </mesh>
        <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.012, 8, 64]} />
          <meshBasicMaterial color="#8B5CF6" transparent opacity={0.55} />
        </mesh>
        <Html center distanceFactor={6} position={[0, 0, 0]}>
          <span className="font-display font-bold text-cyan-300 text-sm tracking-widest pointer-events-none select-none drop-shadow-[0_0_12px_rgba(0,198,255,0.8)]">
            AI
          </span>
        </Html>
      </Float>
    </group>
  )
}

function OrbitNode({ pos, color, label }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * 0.75 + pos[0]) * 0.12
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.35}>
      <group ref={ref} position={pos}>
        <mesh>
          <sphereGeometry args={[0.14, 20, 20]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
        </mesh>
        <Html center distanceFactor={9} position={[0, 0.35, 0]}>
          <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/15 bg-black/70 text-slate-200 whitespace-nowrap pointer-events-none backdrop-blur-sm">
            {label}
          </span>
        </Html>
      </group>
    </Float>
  )
}

function DataLines() {
  const points = useMemo(() => {
    const center = new THREE.Vector3(0, 0.2, 0)
    return ORBIT_NODES.map((n) => [center, new THREE.Vector3(...n.pos)])
  }, [])

  return (
    <group>
      {points.map((pair, i) => (
        <Line
          key={ORBIT_NODES[i].label}
          points={pair}
          color="#00C6FF"
          lineWidth={1}
          transparent
          opacity={0.2}
        />
      ))}
    </group>
  )
}

function GlowingPlatform() {
  const ring1 = useRef()
  const ring2 = useRef()
  const pulse = useRef()

  useFrame((state, dt) => {
    if (ring1.current) ring1.current.rotation.z += dt * 0.04
    if (ring2.current) ring2.current.rotation.z -= dt * 0.025
    if (pulse.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.02
      pulse.current.scale.set(s, 1, s)
    }
  })

  return (
    <group position={[0, -1.05, 0]}>
      <mesh ref={pulse} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.6, 0.12, 64]} />
        <meshStandardMaterial
          color="#12082a"
          emissive="#8B5CF6"
          emissiveIntensity={0.35}
          metalness={0.85}
          roughness={0.3}
        />
      </mesh>
      {/* Inner glow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.065, 0]}>
        <circleGeometry args={[2.4, 48]} />
        <meshBasicMaterial color="#0066FF" transparent opacity={0.08} />
      </mesh>
      <group rotation={[Math.PI / 2.1, 0, 0]} position={[0, 0.08, 0]}>
        <mesh ref={ring1}>
          <torusGeometry args={[3.5, 0.035, 12, 80]} />
          <meshBasicMaterial color="#8B5CF6" transparent opacity={0.5} />
        </mesh>
        <mesh ref={ring2}>
          <torusGeometry args={[3.9, 0.015, 8, 80]} />
          <meshBasicMaterial color="#00C6FF" transparent opacity={0.3} />
        </mesh>
      </group>
      <pointLight position={[0, 0.5, 0]} intensity={1.2} color="#8B5CF6" distance={6} />
    </group>
  )
}

function DeviceShowcase() {
  const tier = useDeviceTier()
  const groupRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state, dt) => {
    if (!groupRef.current) return
    const speed = hovered ? 0.06 : 0.12
    groupRef.current.rotation.y += dt * speed
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.12
  })

  const handlers = {
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
  }

  const showLaptop = tier === 'desktop' || tier === 'tablet'
  const showTablet = tier === 'desktop' || tier === 'tablet'
  const showPhone = true

  return (
    <group ref={groupRef} {...handlers}>
      {showLaptop && (
          <RotatingLaptop
            productId="leadedge360"
            position={[0, 0.15, 0]}
            scale={tier === 'tablet' ? 0.85 : 0.95}
            rotSpeed={0.28}
          />
        )}
        {showTablet && (
          <RotatingTablet
            productId="retailedge360"
            position={tier === 'tablet' ? [1.6, 0.35, 0.35] : [2.35, 0.35, 0.4]}
            scale={tier === 'tablet' ? 0.65 : 0.72}
            rotSpeed={0.42}
          />
        )}
        {showPhone && (
          <RotatingPhone
            productId="trinetra360"
            position={tier === 'mobile' ? [0, 0.2, 0] : [-2.05, 0.25, 0.55]}
            scale={tier === 'mobile' ? 1.1 : 0.85}
            rotSpeed={0.52}
          />
        )}
    </group>
  )
}

/** Immersive hero — 3D devices, neural AI sphere, glowing platform, particles. */
export default function HeroImmersiveSceneInner() {
  return (
    <>
      <color attach="background" args={['#030712']} />
      <fog attach="fog" args={['#030712', 5, 14]} />
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={0.9}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[5, 3, 3]} intensity={1.3} color="#00C6FF" />
      <pointLight position={[-4, 2, 2]} intensity={0.9} color="#8B5CF6" />
      <spotLight position={[0, 5, 2]} intensity={0.5} color="#0066FF" angle={0.45} penumbra={1} />

      <Environment preset="night" />
      <Stars radius={45} depth={35} count={1200} factor={2.8} saturation={0.12} fade speed={0.25} />
      <Sparkles count={60} scale={12} size={2} speed={0.3} color="#8B5CF6" opacity={0.35} />

      <GlowingPlatform />
      <ContactShadows position={[0, -0.98, 0]} opacity={0.45} scale={12} blur={2.5} far={5} color="#8B5CF6" />

      <AISphere />
      <DataLines />
      {ORBIT_NODES.map((n) => (
        <OrbitNode key={n.label} {...n} />
      ))}

      <DeviceShowcase />
    </>
  )
}
