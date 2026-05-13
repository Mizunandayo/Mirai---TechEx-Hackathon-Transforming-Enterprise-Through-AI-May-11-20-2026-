// src/components/simulation/PathTrail.tsx

import { useRef, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { pathTrailPointsAtom } from '../../store/simAtoms'
import * as THREE from 'three'


const MAX_TRAIL_POINTS = 1200   // enough for a 20s task at 60fps

export default function PathTrail() {
  const points = useAtomValue(pathTrailPointsAtom)
  const geomRef = useRef<THREE.BufferGeometry>(null)

  // Pre-allocate buffer once
  const posBuffer = useRef(new Float32Array(MAX_TRAIL_POINTS * 3))

  useEffect(() => {
    if (!geomRef.current) return
    const count = Math.min(points.length, MAX_TRAIL_POINTS)
    for (let i = 0; i < count; i++) {
      posBuffer.current[i * 3 + 0] = points[i][0]
      posBuffer.current[i * 3 + 1] = points[i][1]
      posBuffer.current[i * 3 + 2] = points[i][2]
    }

    const attr = geomRef.current.getAttribute('position') as THREE.BufferAttribute
    if (attr) {
      attr.array.set(posBuffer.current.subarray(0, count * 3))
      attr.needsUpdate = true
      geomRef.current.setDrawRange(0, count)
    }
  }, [points])

  if (points.length < 2) return null





  return (
    <line>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          array={posBuffer.current}
          count={MAX_TRAIL_POINTS}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#22c55e"
        transparent
        opacity={0.75}
        linewidth={2}   // Note: linewidth > 1 only works with LineSegments in WebGL1
      />
    </line>
  )
}