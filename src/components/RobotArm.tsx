import { useAtom, useAtomValue } from 'jotai'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, MeshStandardMaterial } from 'three'
import type { ArmSegment } from '../types/arm'
import { armSegmentsAtom, armGripperAtom, selectedSegmentIdAtom } from '../store/atoms'

// ── Color palette (industrial robot arm) ────────────────────────────────────
const C = {
  linkAlum:  '#c2c6ce',
  baseAlum:  '#93979f',
  jointBody: '#18191c',
  jointAxle: '#46494f',
  jointRim:  '#2e3035',
  waist:     '#1c1d20',
  plate:     '#6a6e76',
  plateLip:  '#555860',
  gripBody:  '#2e3137',
  gripRail:  '#505560',
  gripJaw:   '#3a3d43',
  gripPad:   '#161820',
  led:       '#22c55e',
}

const MAT_ALUM  = { metalness: 0.62, roughness: 0.28 } as const
const MAT_STEEL = { metalness: 0.78, roughness: 0.16 } as const
const MAT_CAST  = { metalness: 0.52, roughness: 0.42 } as const
const MAT_RUBB  = { metalness: 0.02, roughness: 0.88 } as const

function JointHousing({ y, r = 0.065 }: { y: number; r?: number }) {
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.058, 32]} />
        <meshStandardMaterial color={C.jointBody} {...MAT_STEEL} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r + 0.007, r + 0.007, 0.010, 32]} />
        <meshStandardMaterial color={C.jointRim} {...MAT_STEEL} />
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

function SegmentGroup({
  seg, yBase, isSelected, onSelect,
}: {
  seg: ArmSegment
  yBase: number
  isSelected: boolean
  onSelect: () => void
}) {
  const mainRef = useRef<MeshStandardMaterial>(null)
  const capRef  = useRef<MeshStandardMaterial>(null)
  const isBase  = seg.joint === 'fixed'
  const yCenter = yBase + seg.length / 2

  useFrame(({ clock }) => {
    const intensity = isSelected
      ? 0.12 + Math.sin(clock.elapsedTime * 2.8) * 0.08
      : 0
    if (mainRef.current) mainRef.current.emissiveIntensity = intensity
    if (capRef.current)  capRef.current.emissiveIntensity  = intensity
  })

  return (
    <group>
      {!isBase && <JointHousing y={yBase} />}
      <mesh
        position={[0, yCenter, 0]}
        castShadow
        onClick={(e: { stopPropagation: () => void }) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        {isBase
          ? <cylinderGeometry args={[0.100, 0.130, seg.length, 22]} />
          : <boxGeometry args={[0.062, Math.max(seg.length - 0.046, 0.01), 0.062]} />
        }
        <meshStandardMaterial
          ref={mainRef}
          color={isSelected ? '#cf7a5a' : (isBase ? C.baseAlum : C.linkAlum)}
          emissive="#cf7a5a"
          emissiveIntensity={0}
          metalness={isBase ? MAT_CAST.metalness : MAT_ALUM.metalness}
          roughness={isBase ? MAT_CAST.roughness : MAT_ALUM.roughness}
        />
      </mesh>
      {!isBase && (
        <mesh position={[0, yBase + seg.length - 0.015, 0]}>
          <boxGeometry args={[0.072, 0.022, 0.072]} />
          <meshStandardMaterial
            ref={capRef}
            color={isSelected ? '#cf7a5a' : '#4e525a'}
            emissive="#cf7a5a"
            emissiveIntensity={0}
            metalness={0.70}
            roughness={0.20}
          />
        </mesh>
      )}
    </group>
  )
}

function ParallelJawGripper({ yTop, width }: { yTop: number; width: number }) {
  const hw = width / 2
  return (
    <group position={[0, yTop, 0]}>
      {/* Mount collar — sits at arm tip */}
      <mesh position={[0, 0.016, 0]}>
        <cylinderGeometry args={[0.076, 0.076, 0.032, 24]} />
        <meshStandardMaterial color={C.waist} {...MAT_STEEL} />
      </mesh>
      {/* Palm body */}
      <mesh position={[0, -0.010, 0]}>
        <boxGeometry args={[hw * 2 + 0.044, 0.038, 0.066]} />
        <meshStandardMaterial color={C.gripBody} {...MAT_ALUM} />
      </mesh>
      {/* Guide rails */}
      <mesh position={[-hw * 0.74, -0.048, 0]}>
        <cylinderGeometry args={[0.0085, 0.0085, 0.056, 10]} />
        <meshStandardMaterial color={C.gripRail} {...MAT_STEEL} />
      </mesh>
      <mesh position={[hw * 0.74, -0.048, 0]}>
        <cylinderGeometry args={[0.0085, 0.0085, 0.056, 10]} />
        <meshStandardMaterial color={C.gripRail} {...MAT_STEEL} />
      </mesh>
      {/* Left jaw — hangs downward, spreads ±X */}
      <mesh position={[-(hw + 0.008), -0.050, 0]}>
        <boxGeometry args={[0.026, 0.060, 0.042]} />
        <meshStandardMaterial color={C.gripJaw} {...MAT_ALUM} />
      </mesh>
      {/* Right jaw */}
      <mesh position={[hw + 0.008, -0.050, 0]}>
        <boxGeometry args={[0.026, 0.060, 0.042]} />
        <meshStandardMaterial color={C.gripJaw} {...MAT_ALUM} />
      </mesh>
      {/* Left rubber pad */}
      <mesh position={[-(hw + 0.008), -0.090, 0]}>
        <boxGeometry args={[0.020, 0.024, 0.032]} />
        <meshStandardMaterial color={C.gripPad} {...MAT_RUBB} />
      </mesh>
      {/* Right rubber pad */}
      <mesh position={[hw + 0.008, -0.090, 0]}>
        <boxGeometry args={[0.020, 0.024, 0.032]} />
        <meshStandardMaterial color={C.gripPad} {...MAT_RUBB} />
      </mesh>
    </group>
  )
}

function SuctionGripper({ yTop }: { yTop: number }) {
  return (
    <group position={[0, yTop, 0]}>
      <mesh position={[0, 0.016, 0]}>
        <cylinderGeometry args={[0.060, 0.060, 0.032, 24]} />
        <meshStandardMaterial color={C.waist} {...MAT_STEEL} />
      </mesh>
      <mesh position={[0, -0.008, 0]}>
        <cylinderGeometry args={[0.038, 0.043, 0.040, 20]} />
        <meshStandardMaterial color={C.gripBody} {...MAT_ALUM} />
      </mesh>
      <mesh position={[0, -0.038, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.032, 0.009, 8, 24]} />
        <meshStandardMaterial color="#1c1e22" {...MAT_RUBB} />
      </mesh>
      <mesh position={[0, -0.054, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.027, 0.009, 8, 24]} />
        <meshStandardMaterial color="#1c1e22" {...MAT_RUBB} />
      </mesh>
      <mesh position={[0, -0.070, 0]}>
        <cylinderGeometry args={[0.042, 0.042, 0.012, 24]} />
        <meshStandardMaterial color="#141618" {...MAT_RUBB} />
      </mesh>
    </group>
  )
}

function MagneticGripper({ yTop }: { yTop: number }) {
  return (
    <group position={[0, yTop, 0]}>
      <mesh position={[0, 0.016, 0]}>
        <cylinderGeometry args={[0.068, 0.068, 0.032, 24]} />
        <meshStandardMaterial color={C.waist} {...MAT_STEEL} />
      </mesh>
      <mesh position={[0, -0.014, 0]}>
        <cylinderGeometry args={[0.070, 0.075, 0.050, 32]} />
        <meshStandardMaterial color={C.gripBody} {...MAT_ALUM} />
      </mesh>
      <mesh position={[0, -0.041, 0]}>
        <cylinderGeometry args={[0.060, 0.060, 0.008, 24]} />
        <meshStandardMaterial color="#14161a" metalness={0.84} roughness={0.10} />
      </mesh>
      <mesh position={[0.052, 0, 0]}>
        <sphereGeometry args={[0.007, 8, 8]} />
        <meshStandardMaterial color={C.led} emissive={C.led} emissiveIntensity={0.85} roughness={0.30} />
      </mesh>
    </group>
  )
}

export default function RobotArm() {
  const waistRef = useRef<Group>(null)
  const segments = useAtomValue(armSegmentsAtom)
  const gripper  = useAtomValue(armGripperAtom)
  const [selectedId, setSelectedId] = useAtom(selectedSegmentIdAtom)

  useFrame(({ clock }) => {
    if (waistRef.current) {
      waistRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.14) * 0.022
    }
  })

  const segmentPositions = useMemo(() => {
    const pos: number[] = []
    let y = 0
    segments.forEach((seg) => { pos.push(y); y += seg.length })
    return pos
  }, [segments])

  const totalHeight = segments.reduce((sum, s) => sum + s.length, 0)













  return (

    <group>
      <mesh position={[0, -0.026, 0]} receiveShadow>
        <cylinderGeometry args={[0.250, 0.270, 0.052, 36]} />
        <meshStandardMaterial color={C.plate} {...MAT_CAST} />
      </mesh>
      <mesh position={[0, -0.001, 0]}>
        <cylinderGeometry args={[0.172, 0.192, 0.008, 36]} />
        <meshStandardMaterial color={C.plateLip} metalness={0.62} roughness={0.34} />
      </mesh>

      <group ref={waistRef}>
        <mesh position={[0, 0.022, 0]}>
          <cylinderGeometry args={[0.145, 0.155, 0.044, 36]} />
          <meshStandardMaterial color={C.waist} {...MAT_STEEL} />
        </mesh>
        <mesh position={[0, 0.045, 0]}>
          <cylinderGeometry args={[0.152, 0.160, 0.012, 36]} />
          <meshStandardMaterial color={C.jointRim} {...MAT_STEEL} />
        </mesh>

        {segments.map((seg, i) => (
          <SegmentGroup
            key={seg.id}
            seg={seg}
            yBase={segmentPositions[i]}
            isSelected={seg.id === selectedId}
            onSelect={() => setSelectedId(seg.id === selectedId ? null : seg.id)}
          />
        ))}

        {gripper.type === 'parallel_jaw' && (
          <ParallelJawGripper yTop={totalHeight} width={gripper.width} />
        )}
        {gripper.type === 'suction_cup' && (
          <SuctionGripper yTop={totalHeight} />
        )}
        {gripper.type === 'magnetic' && (
          <MagneticGripper yTop={totalHeight} />
        )}
      </group>
    </group>

  )
}