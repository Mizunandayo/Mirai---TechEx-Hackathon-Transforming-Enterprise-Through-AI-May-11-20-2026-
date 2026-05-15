import { useRef, useMemo, useEffect, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, BallCollider, type RigidBodyApi } from '@react-three/rapier'
import { useAtomValue } from 'jotai'
import { PointLight } from 'three'
import { armSegmentsAtom, armGripperAtom } from '../../store/atoms'
import { currentSimFrameAtom } from '../../store/simAtoms'
import type { ArmSegment, GripperConfig } from '../../types/arm'
import ArmPhysicsRig from './ArmPhysicsRig'

const C = {
  linkAlum: '#c2c6ce',
  baseAlum: '#93979f',
  jointBody: '#18191c',
  jointAxle: '#46494f',
  jointRim: '#2e3035',
  waist: '#1c1d20',
  plate: '#6a6e76',
  plateLip: '#555860',
  gripBody: '#2e3137',
  gripRail: '#505560',
  gripJaw: '#3a3d43',
  gripPad: '#161820',
  led: '#22c55e',
}
const STEEL = { metalness: 0.78, roughness: 0.16 } as const
const ALUM = { metalness: 0.62, roughness: 0.28 } as const
const RUBB = { metalness: 0.02, roughness: 0.88 } as const

function JointHousing({ r = 0.065 }: { r?: number }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.058, 32]} />
        <meshStandardMaterial color={C.jointBody} {...STEEL} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r + 0.007, r + 0.007, 0.01, 32]} />
        <meshStandardMaterial color={C.jointRim} {...STEEL} />
      </mesh>
      <mesh position={[-(r + 0.014), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.42, r * 0.42, 0.018, 18]} />
        <meshStandardMaterial color={C.jointAxle} metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[r + 0.014, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.42, r * 0.42, 0.018, 18]} />
        <meshStandardMaterial color={C.jointAxle} metalness={0.65} roughness={0.3} />
      </mesh>
    </group>
  )
}

function GripperVisual({
  gripper,
  open,
  isSelected,
  isHovered,
  onHover,
  onHoverEnd,
  onBeginManipulation,
}: {
  gripper: GripperConfig
  open: boolean
  isSelected: boolean
  isHovered: boolean
  onHover?: () => void
  onHoverEnd?: () => void
  onBeginManipulation?: () => void
}) {
  const hw = gripper.width / 2
  const jawOffset = hw * (open ? 1.0 : 0.18)
  const active = isSelected || isHovered
  const selectedEmissive = active ? '#2563eb' : '#000000'
  const selectedIntensity = active ? 0.35 : 0

  if (gripper.type === 'parallel_jaw') {
    return (
      <group
        onPointerEnter={onHover ? (e) => { e.stopPropagation(); onHover() } : undefined}
        onPointerLeave={onHoverEnd ? (e) => { e.stopPropagation(); onHoverEnd() } : undefined}
        onPointerDown={onBeginManipulation ? (e) => {
          if (e.button !== 0) return
          e.stopPropagation()
          onBeginManipulation()
        } : undefined}
      >
        <mesh position={[0, 0.016, 0]}>
          <cylinderGeometry args={[0.076, 0.076, 0.032, 24]} />
          <meshStandardMaterial color={C.waist} {...STEEL} emissive={selectedEmissive} emissiveIntensity={selectedIntensity} />
        </mesh>
        <mesh position={[0, -0.01, 0]}>
          <boxGeometry args={[hw * 2 + 0.044, 0.038, 0.066]} />
          <meshStandardMaterial color={C.gripBody} {...ALUM} emissive={selectedEmissive} emissiveIntensity={selectedIntensity} />
        </mesh>
        <mesh position={[-(jawOffset + 0.008), -0.05, 0]}>
          <boxGeometry args={[0.026, 0.06, 0.042]} />
          <meshStandardMaterial color={C.gripJaw} {...ALUM} />
        </mesh>
        <mesh position={[jawOffset + 0.008, -0.05, 0]}>
          <boxGeometry args={[0.026, 0.06, 0.042]} />
          <meshStandardMaterial color={C.gripJaw} {...ALUM} />
        </mesh>
        <mesh position={[-(jawOffset + 0.008), -0.09, 0]}>
          <boxGeometry args={[0.02, 0.024, 0.032]} />
          <meshStandardMaterial color={C.gripPad} {...RUBB} />
        </mesh>
        <mesh position={[jawOffset + 0.008, -0.09, 0]}>
          <boxGeometry args={[0.02, 0.024, 0.032]} />
          <meshStandardMaterial color={C.gripPad} {...RUBB} />
        </mesh>
      </group>
    )
  }

  if (gripper.type === 'suction_cup') {
    return (
      <group
        onPointerEnter={onHover ? (e) => { e.stopPropagation(); onHover() } : undefined}
        onPointerLeave={onHoverEnd ? (e) => { e.stopPropagation(); onHoverEnd() } : undefined}
        onPointerDown={onBeginManipulation ? (e) => {
          if (e.button !== 0) return
          e.stopPropagation()
          onBeginManipulation()
        } : undefined}
      >
        <mesh position={[0, 0.016, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.032, 24]} />
          <meshStandardMaterial color={C.waist} {...STEEL} emissive={selectedEmissive} emissiveIntensity={selectedIntensity} />
        </mesh>
        <mesh position={[0, -0.008, 0]}>
          <cylinderGeometry args={[0.038, 0.043, 0.04, 20]} />
          <meshStandardMaterial color={C.gripBody} {...ALUM} />
        </mesh>
        <mesh position={[0, -0.07, 0]}>
          <cylinderGeometry args={[0.042, 0.042, 0.012, 24]} />
          <meshStandardMaterial color="#141618" {...RUBB} />
        </mesh>
      </group>
    )
  }

  return (
    <group
      onPointerEnter={onHover ? (e) => { e.stopPropagation(); onHover() } : undefined}
      onPointerLeave={onHoverEnd ? (e) => { e.stopPropagation(); onHoverEnd() } : undefined}
      onPointerDown={onBeginManipulation ? (e) => {
        if (e.button !== 0) return
        e.stopPropagation()
        onBeginManipulation()
      } : undefined}
    >
      <mesh position={[0, 0.016, 0]}>
        <cylinderGeometry args={[0.068, 0.068, 0.032, 24]} />
        <meshStandardMaterial color={C.waist} {...STEEL} emissive="#000000" emissiveIntensity={0} />
      </mesh>
      <mesh position={[0, -0.014, 0]}>
        <cylinderGeometry args={[0.07, 0.075, 0.05, 32]} />
        <meshStandardMaterial color={C.gripBody} {...ALUM} />
      </mesh>
      <mesh position={[0.052, 0, 0]}>
        <sphereGeometry args={[0.007, 8, 8]} />
        <meshStandardMaterial color={C.led} emissive={C.led} emissiveIntensity={0.85} />
      </mesh>
    </group>
  )
}

interface ChainProps {
  segments: ArmSegment[]
  segIndex: number
  pitchAngles: number[]
  revolveIdx: { current: number }
  gripper: GripperConfig
  gripperOpen: boolean
  flashActive: boolean
  collidingLinkIndex?: number
  cumulativePitchRad: number
  interactive: boolean
  selectedPartId: string | null
  hoveredPartId: string | null
  onHoverPart?: (partId: string | null) => void
  onBeginManipulation?: (partId: string) => void
  children?: ReactNode
}

function SegmentChain({
  segments,
  segIndex,
  pitchAngles,
  revolveIdx,
  gripper,
  gripperOpen,
  flashActive,
  collidingLinkIndex,
  cumulativePitchRad,
  interactive,
  selectedPartId,
  hoveredPartId,
  onHoverPart,
  onBeginManipulation,
}: ChainProps) {
  if (segIndex >= segments.length) {
    return (
      <group rotation={[-cumulativePitchRad, 0, 0]}>
        <GripperVisual
          gripper={gripper}
          open={gripperOpen}
          isSelected={selectedPartId === 'gripper'}
          isHovered={hoveredPartId === 'gripper'}
          onHover={interactive ? () => onHoverPart?.('gripper') : undefined}
          onHoverEnd={interactive ? () => onHoverPart?.(null) : undefined}
          onBeginManipulation={interactive ? () => onBeginManipulation?.('gripper') : undefined}
        />
      </group>
    )
  }

  const seg = segments[segIndex]
  const isBase = seg.joint === 'fixed'

  let pitchRad = 0
  if (!isBase) {
    pitchRad = (pitchAngles[revolveIdx.current] ?? 0) * (Math.PI / 180)
    revolveIdx.current += 1
  }

  const width = isBase ? 0.1 : 0.062
  const height = seg.length
  const partId = isBase ? 'waist' : `segment-${segIndex}`
  const isSelected = selectedPartId === partId
  const isHovered = hoveredPartId === partId
  const isActive = isSelected || isHovered
  const isCollidedLink =
    flashActive &&
    !isBase &&
    (typeof collidingLinkIndex === 'number' ? collidingLinkIndex === segIndex : true)

  return (
    <group
      rotation={[pitchRad, 0, 0]}
      onPointerEnter={interactive ? (e) => { e.stopPropagation(); onHoverPart?.(partId) } : undefined}
      onPointerLeave={interactive ? (e) => { e.stopPropagation(); onHoverPart?.(null) } : undefined}
      onPointerDown={interactive ? (e) => {
        if (e.button !== 0) return
        e.stopPropagation()
        onBeginManipulation?.(partId)
      } : undefined}
    >
      {!isBase && <JointHousing />}

      <mesh position={[0, height / 2, 0]} castShadow>
        {isBase
          ? <cylinderGeometry args={[width, width * 1.25, height, 22]} />
          : <boxGeometry args={[width, Math.max(height - 0.046, 0.01), width]} />
        }
        <meshStandardMaterial
          color={isBase ? C.baseAlum : C.linkAlum}
          {...ALUM}
          emissive={isCollidedLink ? '#ef4444' : isActive ? '#2563eb' : '#000000'}
          emissiveIntensity={isCollidedLink ? 0.6 : isActive ? 0.35 : 0}
        />
      </mesh>

      {!isBase && (
        <mesh position={[0, height - 0.015, 0]}>
          <boxGeometry args={[0.072, 0.022, 0.072]} />
          <meshStandardMaterial
            color="#4e525a"
            metalness={0.7}
            roughness={0.2}
            emissive={isCollidedLink ? '#ef4444' : '#000000'}
            emissiveIntensity={isCollidedLink ? 0.3 : 0}
          />
        </mesh>
      )}

      <group position={[0, height, 0]}>
        <SegmentChain
          segments={segments}
          segIndex={segIndex + 1}
          pitchAngles={pitchAngles}
          revolveIdx={revolveIdx}
          gripper={gripper}
          gripperOpen={gripperOpen}
          flashActive={flashActive}
          collidingLinkIndex={collidingLinkIndex}
          cumulativePitchRad={cumulativePitchRad + (isBase ? 0 : pitchRad)}
          interactive={interactive}
          selectedPartId={selectedPartId}
          hoveredPartId={hoveredPartId}
          onHoverPart={onHoverPart}
          onBeginManipulation={onBeginManipulation}
        />
      </group>
    </group>
  )
}

interface SimulatedArmProps {
  interactive?: boolean
  selectedPartId?: string | null
  hoveredPartId?: string | null
  onHoverPart?: (partId: string | null) => void
  onBeginManipulation?: (partId: string) => void
  poseOverride?: {
    waistYawDeg: number
    pitchAngles: number[]
    endEffectorPos: [number, number, number]
  } | null
}

export default function SimulatedArm({
  interactive = false,
  selectedPartId = null,
  hoveredPartId = null,
  onHoverPart,
  onBeginManipulation,
  poseOverride = null,
}: SimulatedArmProps) {
  const segments = useAtomValue(armSegmentsAtom)
  const gripper = useAtomValue(armGripperAtom)
  const frame = useAtomValue(currentSimFrameAtom)

  const pitchAngles = poseOverride?.pitchAngles ?? frame?.pitchAngles ?? []
  const waistYawDeg = poseOverride?.waistYawDeg ?? frame?.waistYawDeg ?? 0
  const gripperOpen = frame?.gripperOpen ?? true
  const isCollision = frame?.isCollision ?? false
  const collidingLinkIndex = frame?.collidingLinkIndex
  const endEffector = poseOverride?.endEffectorPos ?? frame?.endEffectorPos ?? [0, 0, 0]

  const kinematicRef = useRef<RigidBodyApi>(null)
  const collisionLightRef = useRef<PointLight | null>(null)
  const prevCollisionRef = useRef(false)
  const flashUntilRef = useRef<number>(0)

  useEffect(() => {
    if (isCollision) {
      flashUntilRef.current = performance.now() + 10000 // Stay active while colliding
    }
    prevCollisionRef.current = isCollision
  }, [isCollision])

  useFrame(() => {
    if (kinematicRef.current) {
      kinematicRef.current.setNextKinematicTranslation({
        x: endEffector[0],
        y: endEffector[1],
        z: endEffector[2],
      })
    }

    if (collisionLightRef.current) {
      const active = isCollision
      collisionLightRef.current.visible = active

      if (active) {
        const now = performance.now()
        const pulse = Math.abs(Math.sin(now * 0.024))
        collisionLightRef.current.intensity = 2.2 + pulse * 2.4
      }
    }
  })

  const revolveIdx = useMemo(() => ({ current: 0 }), [pitchAngles, waistYawDeg])
  revolveIdx.current = 0
  const flashActive = isCollision

  return (
    <group>
      <mesh position={[0, -0.026, 0]} receiveShadow>
        <cylinderGeometry args={[0.25, 0.27, 0.052, 36]} />
        <meshStandardMaterial color={C.plate} {...ALUM} />
      </mesh>

      <mesh position={[0, -0.001, 0]}>
        <cylinderGeometry args={[0.172, 0.192, 0.008, 36]} />
        <meshStandardMaterial color={C.plateLip} metalness={0.62} roughness={0.34} />
      </mesh>

      <group rotation={[0, waistYawDeg * (Math.PI / 180), 0]}>
        <mesh position={[0, 0.022, 0]}>
          <cylinderGeometry args={[0.145, 0.155, 0.044, 36]} />
          <meshStandardMaterial color={C.waist} {...STEEL} />
        </mesh>

        <group position={[0, 0.044, 0]}>
          <SegmentChain
            segments={segments}
            segIndex={0}
            pitchAngles={pitchAngles}
            revolveIdx={revolveIdx}
            gripper={gripper}
            gripperOpen={gripperOpen}
            flashActive={flashActive}
            collidingLinkIndex={collidingLinkIndex}
            cumulativePitchRad={0}
            interactive={interactive}
            selectedPartId={selectedPartId}
            hoveredPartId={hoveredPartId}
            onHoverPart={onHoverPart}
            onBeginManipulation={onBeginManipulation}
          />
        </group>
      </group>

      <ArmPhysicsRig
        segments={segments}
        pitchAngles={pitchAngles}
        waistYawDeg={waistYawDeg}
        enabled
        debug={false}
      />

      <RigidBody type="kinematicPosition" ref={kinematicRef} colliders={false}>
        <BallCollider args={[0.04]} />
      </RigidBody>

      <pointLight
        ref={collisionLightRef}
        position={endEffector}
        color="#ef4444"
        intensity={0}
        distance={0.55}
        decay={2}
        visible={false}
      />
    </group>
  )
}