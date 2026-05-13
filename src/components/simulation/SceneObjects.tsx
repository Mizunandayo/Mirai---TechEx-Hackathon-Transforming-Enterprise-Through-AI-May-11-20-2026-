// src/components/simulation/SceneObjects.tsx

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAtomValue } from 'jotai'
import { Quaternion } from 'three'
import { RigidBody, CuboidCollider, CylinderCollider, type RigidBodyApi } from '@react-three/rapier'
import { sceneGraphAtom } from '../../store/taskAtoms'
import { currentSimFrameAtom, currentFrameAtom } from '../../store/simAtoms'


export default function SceneObjects() {
  const scene        = useAtomValue(sceneGraphAtom)
  const currentFrame = useAtomValue(currentSimFrameAtom)
  const frameNumber  = useAtomValue(currentFrameAtom)

  // Mirror current frame in a ref so useFrame callback is never stale
  const frameRef = useRef(currentFrame)
  frameRef.current = currentFrame

  // Map of object id → Rapier RigidBodyApi for dynamic objects
  const bodyRefs = useRef<Map<string, RigidBodyApi>>(new Map())

  // Grip-offset carry: tracks which object was held last tick and the
  // positional delta between its actual Rapier position and the baked
  // heldObjectPos at the moment grip closed. Carrying with this offset
  // prevents the object from snapping to the compiled position when it was
  // physically displaced during the arm's approach phase.
  const prevHeldIdRef  = useRef<string | null>(null)
  const gripOffsetRef  = useRef<[number, number, number]>([0, 0, 0])

  // When playback resets to frame 0 (loop or manual rewind), teleport every
  // dynamic body back to its original position so the scene looks fresh.
  useEffect(() => {
    if (frameNumber !== 0) return
    prevHeldIdRef.current = null
    gripOffsetRef.current = [0, 0, 0]
    for (const obj of scene.objects) {
      const body = bodyRefs.current.get(obj.id)
      if (!body) continue
      const [x, y, z] = obj.position
      body.setTranslation({ x, y, z }, true)
      body.setRotation(new Quaternion(0, 0, 0, 1), true)
      body.setLinvel({ x: 0, y: 0, z: 0 }, false)
      body.setAngvel({ x: 0, y: 0, z: 0 }, false)
    }
  }, [frameNumber, scene.objects])

  useFrame(() => {
    const frame        = frameRef.current
    const currentHeld  = frame?.heldObjectId ?? null

    // ── Freeze approach target ───────────────────────────────────────────────
    // While the arm is descending toward an object (grip still open), pin that
    // object to its original scene position so the kinematic arm collider
    // cannot push it away. This guarantees the arm arrives at the exact
    // compiled grab center.
    if (frame?.approachTargetId && !currentHeld) {
      const approachBody = bodyRefs.current.get(frame.approachTargetId)
      if (approachBody) {
        const orig = scene.objects.find((o) => o.id === frame.approachTargetId)
        if (orig) {
          const [ox, oy, oz] = orig.position
          approachBody.setTranslation({ x: ox, y: oy, z: oz }, true)
          approachBody.setLinvel({ x: 0, y: 0, z: 0 }, false)
          approachBody.setAngvel({ x: 0, y: 0, z: 0 }, false)
        }
      }
    }

    // ── Detect grip-close transition ─────────────────────────────────────────
    if (currentHeld !== prevHeldIdRef.current) {
      if (currentHeld && frame?.heldObjectPos) {
        // Grip just closed — snapshot the delta between the object's actual
        // Rapier position and the baked heldObjectPos so carry is snap-free.
        const body = bodyRefs.current.get(currentHeld)
        if (body) {
          const actual = body.translation()
          const [bx, by, bz] = frame.heldObjectPos
          gripOffsetRef.current = [actual.x - bx, actual.y - by, actual.z - bz]
        } else {
          gripOffsetRef.current = [0, 0, 0]
        }
      } else {
        // Grip opened — clear offset
        gripOffsetRef.current = [0, 0, 0]
      }
      prevHeldIdRef.current = currentHeld
    }

    // ── Carry: pin held object to gripper + recorded offset ──────────────────
    if (!currentHeld || !frame?.heldObjectPos) return
    const body = bodyRefs.current.get(currentHeld)
    if (!body) return
    const [bx, by, bz] = frame.heldObjectPos
    const [ox, oy, oz] = gripOffsetRef.current
    body.setTranslation({ x: bx + ox, y: by + oy, z: bz + oz }, true)
    body.setLinvel({ x: 0, y: 0, z: 0 }, false)
    body.setAngvel({ x: 0, y: 0, z: 0 }, false)
  })

  return (
    <>
      {scene.objects.map((obj) => {
        const [w, h, d] = obj.dimensions
        const [x, y, z] = obj.position
        const color = obj.color ?? '#c8b89a'

        if (obj.type === 'surface') {
          return (
            <RigidBody key={obj.id} type="fixed" position={[x, y, z]} colliders={false}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color={color} roughness={0.75} metalness={0} />
              </mesh>
              <CuboidCollider args={[w / 2, h / 2, d / 2]} />
            </RigidBody>
          )
        }

        if (obj.type === 'box') {
          return (
            <RigidBody
              key={obj.id}
              ref={(api) => {
                if (api) bodyRefs.current.set(obj.id, api)
                else bodyRefs.current.delete(obj.id)
              }}
              type="dynamic"
              position={[x, y, z]}
              mass={0.15}
              linearDamping={0.8}
              angularDamping={0.9}
              colliders={false}
            >
              <mesh castShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} />
              </mesh>
              <CuboidCollider args={[w / 2, h / 2, d / 2]} restitution={0.1} friction={0.7} />
            </RigidBody>
          )
        }

        if (obj.type === 'cylinder') {
          return (
            <RigidBody
              key={obj.id}
              ref={(api) => {
                if (api) bodyRefs.current.set(obj.id, api)
                else bodyRefs.current.delete(obj.id)
              }}
              type="dynamic"
              position={[x, y, z]}
              mass={0.1}
              linearDamping={0.8}
              angularDamping={0.9}
              colliders={false}
            >
              <mesh castShadow>
                <cylinderGeometry args={[w / 2, w / 2, h, 16]} />
                <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} />
              </mesh>
              <CylinderCollider args={[h / 2, w / 2]} restitution={0.05} friction={0.7} />
            </RigidBody>
          )
        }

        if (obj.type === 'zone') {
          // Zone = visual dashed outline + faint fill, no physics body
          return (
            <group key={obj.id} position={[x, y, z]}>
              <mesh>
                <boxGeometry args={[w, h, d]} />
                <meshBasicMaterial color="#4ade80" transparent opacity={0.06} depthWrite={false} />
              </mesh>
            </group>
          )
        }

        return null
      })}

      {/* Target zones — flat disc indicators on floor level */}
      {scene.targetZones.map((zone) => (
        <mesh key={zone.id} position={zone.position} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[zone.radius * 0.7, zone.radius, 24]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} depthWrite={false} side={2} />
        </mesh>
      ))}
    </>
  )
}