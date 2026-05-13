// src/components/simulation/SimulatedArm.tsx

import { useRef, useMemo, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, BallCollider, type RigidBodyApi } from '@react-three/rapier'
import { useAtomValue } from 'jotai'
import { armSegmentsAtom, armGripperAtom } from '../../store/atoms'
import { currentSimFrameAtom } from '../../store/simAtoms'
import type { ArmSegment, GripperConfig } from '../../types/arm'

// ─── Color palette (matches RobotArm.tsx exactly) ────────────────────────────
const C = {
  linkAlum:  '#c2c6ce', baseAlum: '#93979f',
  jointBody: '#18191c', jointAxle: '#46494f', jointRim: '#2e3035',
  waist:     '#1c1d20', plate: '#6a6e76',     plateLip: '#555860',
  gripBody:  '#2e3137', gripRail: '#505560',   gripJaw: '#3a3d43',
  gripPad:   '#161820', led: '#22c55e',
}
const STEEL = { metalness: 0.78, roughness: 0.16 } as const
const ALUM  = { metalness: 0.62, roughness: 0.28 } as const
const RUBB  = { metalness: 0.02, roughness: 0.88 } as const

// ─── Sub-components ───────────────────────────────────────────────────────────

function JointHousing({ r = 0.065 }: { r?: number }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.058, 32]} />
        <meshStandardMaterial color={C.jointBody} {...STEEL} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r + 0.007, r + 0.007, 0.010, 32]} />
        <meshStandardMaterial color={C.jointRim} {...STEEL} />
      </mesh>
      <mesh position={[-(r + 0.014), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.42, r * 0.42, 0.018, 18]} />
        <meshStandardMaterial color={C.jointAxle} metalness={0.65} roughness={0.30} />
      </mesh>
      <mesh position={[r + 0.014, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.42, r * 0.42, 0.018, 18]} />
        <meshStandardMaterial color={C.jointAxle} metalness={0.65} roughness={0.30} />
      </mesh>
    </group>
  )
}

function GripperVisual({
  gripper,
  open,
}: {
  gripper: GripperConfig
  open: boolean
}) {
  const hw = gripper.width / 2
  const jawOffset = hw * (open ? 1.0 : 0.18)

  if (gripper.type === 'parallel_jaw') {
    return (
      <group>
        {/* Mount collar — sits at arm tip */}
        <mesh position={[0, 0.016, 0]}>
          <cylinderGeometry args={[0.076, 0.076, 0.032, 24]} />
          <meshStandardMaterial color={C.waist} {...STEEL} />
        </mesh>
        {/* Palm body */}
        <mesh position={[0, -0.010, 0]}>
          <boxGeometry args={[hw * 2 + 0.044, 0.038, 0.066]} />
          <meshStandardMaterial color={C.gripBody} {...ALUM} />
        </mesh>
        {/* Left jaw — hangs downward, spreads ±X */}
        <mesh position={[-(jawOffset + 0.008), -0.050, 0]}>
          <boxGeometry args={[0.026, 0.060, 0.042]} />
          <meshStandardMaterial color={C.gripJaw} {...ALUM} />
        </mesh>
        {/* Right jaw */}
        <mesh position={[jawOffset + 0.008, -0.050, 0]}>
          <boxGeometry args={[0.026, 0.060, 0.042]} />
          <meshStandardMaterial color={C.gripJaw} {...ALUM} />
        </mesh>
        {/* Left rubber pad (gripping surface) */}
        <mesh position={[-(jawOffset + 0.008), -0.090, 0]}>
          <boxGeometry args={[0.020, 0.024, 0.032]} />
          <meshStandardMaterial color={C.gripPad} {...RUBB} />
        </mesh>
        {/* Right rubber pad */}
        <mesh position={[jawOffset + 0.008, -0.090, 0]}>
          <boxGeometry args={[0.020, 0.024, 0.032]} />
          <meshStandardMaterial color={C.gripPad} {...RUBB} />
        </mesh>
      </group>
    )
  }

  if (gripper.type === 'suction_cup') {
    return (
      <group>
        <mesh position={[0, 0.016, 0]}>
          <cylinderGeometry args={[0.060, 0.060, 0.032, 24]} />
          <meshStandardMaterial color={C.waist} {...STEEL} />
        </mesh>
        <mesh position={[0, -0.008, 0]}>
          <cylinderGeometry args={[0.038, 0.043, 0.040, 20]} />
          <meshStandardMaterial color={C.gripBody} {...ALUM} />
        </mesh>
        <mesh position={[0, -0.070, 0]}>
          <cylinderGeometry args={[0.042, 0.042, 0.012, 24]} />
          <meshStandardMaterial color="#141618" {...RUBB} />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      <mesh position={[0, 0.016, 0]}>
        <cylinderGeometry args={[0.068, 0.068, 0.032, 24]} />
        <meshStandardMaterial color={C.waist} {...STEEL} />
      </mesh>
      <mesh position={[0, -0.014, 0]}>
        <cylinderGeometry args={[0.070, 0.075, 0.050, 32]} />
        <meshStandardMaterial color={C.gripBody} {...ALUM} />
      </mesh>
      <mesh position={[0.052, 0, 0]}>
        <sphereGeometry args={[0.007, 8, 8]} />
        <meshStandardMaterial color={C.led} emissive={C.led} emissiveIntensity={0.85} />
      </mesh>
    </group>
  )
}

// ─── Recursive nested arm builder ─────────────────────────────────────────────

interface ChainProps {
  segments: ArmSegment[]
  segIndex: number
  pitchAngles: number[]
  revolveIdx: { current: number }
  gripper: GripperConfig
  gripperOpen: boolean
  isCollision: boolean
  cumulativePitchRad: number  // accumulated pitch from all parent joints
  children?: ReactNode
}

function SegmentChain({
  segments, segIndex, pitchAngles, revolveIdx, gripper, gripperOpen, isCollision,
  cumulativePitchRad,
}: ChainProps) {
  if (segIndex >= segments.length) {
    // Leaf: counter-rotate the gripper by the total accumulated pitch so it
    // always faces straight down in world space — simulates a wrist leveling joint.
    // Without this, the gripper tilts with the arm and can never properly face
    // down-at-objects on the table.
    return (
      <group rotation={[-cumulativePitchRad, 0, 0]}>
        <GripperVisual gripper={gripper} open={gripperOpen} />
      </group>
    )
  }

  const seg = segments[segIndex]
  const isBase = seg.joint === 'fixed'

  let pitchRad = 0
  if (!isBase) {
    pitchRad = (pitchAngles[revolveIdx.current] ?? 0) * (Math.PI / 180)
    revolveIdx.current++
  }

  const W = isBase ? 0.100 : 0.062
  const H = seg.length

  return (
    // This group's rotation = this joint's DELTA angle.
    // All children (next segment + gripper) rotate with it.
    <group rotation={[pitchRad, 0, 0]}>
      {!isBase && <JointHousing />}

      {/* Segment body */}
      <mesh position={[0, H / 2, 0]} castShadow>
        {isBase
          ? <cylinderGeometry args={[W, W * 1.25, H, 22]} />
          : <boxGeometry args={[W, Math.max(H - 0.046, 0.01), W]} />
        }
        <meshStandardMaterial
          color={isBase ? C.baseAlum : C.linkAlum}
          {...(isBase ? ALUM : ALUM)}
          emissive={isCollision && !isBase ? '#ef4444' : '#000000'}
          emissiveIntensity={isCollision && !isBase ? 0.45 : 0}
        />
      </mesh>

      {!isBase && (
        <mesh position={[0, H - 0.015, 0]}>
          <boxGeometry args={[0.072, 0.022, 0.072]} />
          <meshStandardMaterial color="#4e525a" metalness={0.70} roughness={0.20} />
        </mesh>
      )}

      {/* Mount next segment at the tip, passing updated cumulative pitch */}
      <group position={[0, H, 0]}>
        <SegmentChain
          segments={segments}
          segIndex={segIndex + 1}
          pitchAngles={pitchAngles}
          revolveIdx={revolveIdx}
          gripper={gripper}
          gripperOpen={gripperOpen}
          isCollision={isCollision}
          cumulativePitchRad={cumulativePitchRad + (isBase ? 0 : pitchRad)}
        />
      </group>
    </group>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function SimulatedArm() {
  const segments   = useAtomValue(armSegmentsAtom)
  const gripper    = useAtomValue(armGripperAtom)
  const frame      = useAtomValue(currentSimFrameAtom)

  const pitchAngles  = frame?.pitchAngles ?? []
  const waistYawDeg  = frame?.waistYawDeg ?? 0
  const gripperOpen  = frame?.gripperOpen ?? true
  const isCollision  = frame?.isCollision ?? false
  const endEffector  = frame?.endEffectorPos ?? [0, 0, 0]

  // Kinematic Rapier body — tracked by FK, pushes environment objects
  const kinematicRef = useRef<RigidBodyApi>(null)

  useFrame(() => {
    if (kinematicRef.current) {
      // Update kinematic body position every frame — this is what pushes dynamic objects
      kinematicRef.current.setNextKinematicTranslation({
        x: endEffector[0],
        y: endEffector[1],
        z: endEffector[2],
      })
    }
  })

  // revolveIdx as a ref so the recursive SegmentChain can increment it
  const revolveIdx = useMemo(() => ({ current: 0 }), [pitchAngles, waistYawDeg])
  // Reset on each new frame (reassign during render — safe because pitchAngles changes)
  revolveIdx.current = 0

  return (
    <group>
      {/* Static ground plate */}
      <mesh position={[0, -0.026, 0]} receiveShadow>
        <cylinderGeometry args={[0.250, 0.270, 0.052, 36]} />
        <meshStandardMaterial color={C.plate} {...ALUM} />
      </mesh>
      <mesh position={[0, -0.001, 0]}>
        <cylinderGeometry args={[0.172, 0.192, 0.008, 36]} />
        <meshStandardMaterial color={C.plateLip} metalness={0.62} roughness={0.34} />
      </mesh>

      {/* Waist rotation group */}
      <group rotation={[0, waistYawDeg * (Math.PI / 180), 0]}>
        {/* Waist housing */}
        <mesh position={[0, 0.022, 0]}>
          <cylinderGeometry args={[0.145, 0.155, 0.044, 36]} />
          <meshStandardMaterial color={C.waist} {...STEEL} />
        </mesh>

        {/* Articulated arm chain starting at first segment */}
        <group position={[0, 0.044, 0]}>
          <SegmentChain
            segments={segments}
            segIndex={0}
            pitchAngles={pitchAngles}
            revolveIdx={revolveIdx}
            gripper={gripper}
            gripperOpen={gripperOpen}
            isCollision={isCollision}
            cumulativePitchRad={0}
          />
        </group>
      </group>

      {/* Kinematic Rapier body (invisible) — tracks end-effector, pushes objects */}
      <RigidBody type="kinematicPosition" ref={kinematicRef} colliders={false}>
        <BallCollider args={[0.04]} />
      </RigidBody>

      {/* Collision flash point light */}
      {isCollision && (
        <pointLight
          position={endEffector}
          color="#ef4444"
          intensity={3}
          distance={0.5}
          decay={2}
        />
      )}
    </group>
  )
}