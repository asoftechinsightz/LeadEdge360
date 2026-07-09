'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { createDashboardTexture, resolveProductIdFromSrc } from '@/lib/dashboard-textures'

function useDashboardTexture(productId, textureSrc) {
  const id = productId || resolveProductIdFromSrc(textureSrc)
  return useMemo(() => createDashboardTexture(id), [id])
}

function useRotatingGroup({ speed, position, floatAmp = 0.07 }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  const baseY = position[1]

  useFrame((state, dt) => {
    if (!ref.current) return
    const s = hovered ? speed * 0.1 : speed
    ref.current.rotation.y += dt * s
    ref.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 0.85 + position[0] * 2) * floatAmp
  })

  const handlers = {
    onPointerEnter: (e) => {
      e.stopPropagation()
      setHovered(true)
      document.body.style.cursor = 'pointer'
    },
    onPointerLeave: () => {
      setHovered(false)
      document.body.style.cursor = 'auto'
    },
  }

  return { ref, hovered, handlers }
}

const BEZEL = { color: '#14141f', metalness: 0.85, roughness: 0.25 }
const BODY = { color: '#0c0c14', metalness: 0.75, roughness: 0.35 }

/** 3D laptop with textured screen — continuous Y rotation, slows on hover. */
export function RotatingLaptop({ productId, textureSrc, position = [0, 0, 0], scale = 1, rotSpeed = 0.28 }) {
  const texture = useDashboardTexture(productId, textureSrc)
  const { ref, hovered, handlers } = useRotatingGroup({ speed: rotSpeed, position, floatAmp: 0.06 })

  return (
    <group ref={ref} position={position} scale={scale} {...handlers}>
      {/* Keyboard base */}
      <mesh position={[0, -0.04, 0.22]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.07, 1.65]} />
        <meshStandardMaterial {...BODY} />
      </mesh>
      {/* Trackpad hint */}
      <mesh position={[0, 0.005, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.55, 0.35]} />
        <meshStandardMaterial color="#1e1e2a" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Screen assembly */}
      <group position={[0, 0.38, -0.42]} rotation={[-0.32, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.45, 1.52, 0.05]} />
          <meshStandardMaterial {...BEZEL} />
        </mesh>
        <mesh position={[0, 0, 0.028]} castShadow>
          <planeGeometry args={[2.22, 1.32]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        {/* Screen glass reflection */}
        <mesh position={[0, 0, 0.032]}>
          <planeGeometry args={[2.22, 1.32]} />
          <meshPhysicalMaterial
            transparent
            opacity={hovered ? 0.12 : 0.06}
            color="#ffffff"
            metalness={1}
            roughness={0}
            clearcoat={1}
          />
        </mesh>
      </group>
      {/* Under-glow when hovered */}
      {hovered && (
        <pointLight position={[0, -0.2, 0.3]} intensity={0.8} color="#8B5CF6" distance={3} />
      )}
    </group>
  )
}

/** 3D tablet with textured screen. */
export function RotatingTablet({ productId, textureSrc, position = [0, 0, 0], scale = 1, rotSpeed = 0.42 }) {
  const texture = useDashboardTexture(productId, textureSrc)
  const { ref, hovered, handlers } = useRotatingGroup({ speed: rotSpeed, position, floatAmp: 0.09 })

  return (
    <group ref={ref} position={position} scale={scale} {...handlers}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.15, 1.55, 0.07]} />
        <meshStandardMaterial {...BEZEL} />
      </mesh>
      <mesh position={[0, 0, 0.038]}>
        <planeGeometry args={[1.02, 1.38]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.042]}>
        <planeGeometry args={[1.02, 1.38]} />
        <meshPhysicalMaterial transparent opacity={hovered ? 0.1 : 0.05} color="#fff" metalness={1} roughness={0} clearcoat={1} />
      </mesh>
      {hovered && <pointLight position={[0, 0, 0.5]} intensity={0.5} color="#00C6FF" distance={2} />}
    </group>
  )
}

/** 3D smartphone with textured screen. */
export function RotatingPhone({ productId, textureSrc, position = [0, 0, 0], scale = 1, rotSpeed = 0.55 }) {
  const texture = useDashboardTexture(productId, textureSrc)
  const { ref, hovered, handlers } = useRotatingGroup({ speed: rotSpeed, position, floatAmp: 0.11 })

  return (
    <group ref={ref} position={position} scale={scale} {...handlers}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.88, 0.05]} />
        <meshStandardMaterial {...BEZEL} />
      </mesh>
      <mesh position={[0, 0.02, 0.028]}>
        <planeGeometry args={[0.36, 0.76]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {/* Notch */}
      <mesh position={[0, 0.38, 0.032]}>
        <boxGeometry args={[0.12, 0.025, 0.01]} />
        <meshStandardMaterial color="#000" />
      </mesh>
      <mesh position={[0, 0, 0.032]}>
        <planeGeometry args={[0.36, 0.76]} />
        <meshPhysicalMaterial transparent opacity={hovered ? 0.1 : 0.05} color="#fff" metalness={1} roughness={0} clearcoat={1} />
      </mesh>
      {hovered && <pointLight position={[0, 0, 0.35]} intensity={0.4} color="#0066FF" distance={1.5} />}
    </group>
  )
}

/** Minimal rotating device for product cards. */
export function MiniRotatingScreen({ productId, textureSrc, device = 'phone', rotSpeed = 0.5 }) {
  const texture = useDashboardTexture(productId, textureSrc)
  const ref = useRef()

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * rotSpeed
  })

  const dims =
    device === 'laptop'
      ? { body: [1.8, 0.05, 1.2], screen: [1.6, 0.9], screenRot: -0.3, screenPos: [0, 0.28, -0.35] }
      : device === 'tablet'
        ? { body: [0.9, 1.2, 0.05], screen: [0.78, 1.05], screenRot: 0, screenPos: [0, 0, 0.028] }
        : { body: [0.35, 0.7, 0.04], screen: [0.3, 0.62], screenRot: 0, screenPos: [0, 0, 0.022] }

  return (
    <group ref={ref} scale={0.85}>
      {device === 'laptop' ? (
        <>
          <mesh position={[0, -0.02, 0.12]}>
            <boxGeometry args={dims.body} />
            <meshStandardMaterial {...BODY} />
          </mesh>
          <group position={dims.screenPos} rotation={[dims.screenRot, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.7, 1.05, 0.03]} />
              <meshStandardMaterial {...BEZEL} />
            </mesh>
            <mesh position={[0, 0, 0.018]}>
              <planeGeometry args={dims.screen} />
              <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>
          </group>
        </>
      ) : (
        <>
          <mesh>
            <boxGeometry args={dims.body} />
            <meshStandardMaterial {...BEZEL} />
          </mesh>
          <mesh position={dims.screenPos}>
            <planeGeometry args={dims.screen} />
            <meshBasicMaterial map={texture} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  )
}
