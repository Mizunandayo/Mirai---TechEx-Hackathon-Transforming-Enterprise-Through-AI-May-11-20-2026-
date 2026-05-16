import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAtomValue, useSetAtom } from 'jotai'
import { Quaternion, Mesh } from 'three'
import {
  RigidBody,
  CuboidCollider,
  CylinderCollider,
  type RigidBodyApi,
} from '@react-three/rapier'
import { sceneGraphAtom } from '../../store/taskAtoms'
import {
  currentSimFrameAtom,
  currentFrameAtom,
  simBaselineObjectStatesAtom,
  type SimObjectBaseline,
} from '../../store/simAtoms'

function CollisionHaloBox({
  w,
  h,
  d,
  active,
}: {
  w: number
  h: number
  d: number
  active: boolean
}) {
  const ref = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.visible = active
    if (!active) return

    const pulse = 0.8 + Math.sin(clock.elapsedTime * 8) * 0.2
    ref.current.scale.set(pulse, pulse, pulse)
    const mat = ref.current.material as any
    mat.opacity = 0.28 + (Math.sin(clock.elapsedTime * 8) * 0.5 + 0.5) * 0.12
  })

  return (
    <mesh ref={ref} visible={false}>
      <boxGeometry args={[w * 1.04, h * 1.04, d * 1.04]} />
      <meshBasicMaterial color="#dc2626" transparent opacity={0.32} depthWrite={false} />
    </mesh>
  )
}

function CollisionHaloCylinder({
  r,
  h,
  active,
}: {
  r: number
  h: number
  active: boolean
}) {
  const ref = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.visible = active
    if (!active) return

    const pulse = 0.8 + Math.sin(clock.elapsedTime * 8) * 0.2
    ref.current.scale.set(pulse, pulse, pulse)
    const mat = ref.current.material as any
    mat.opacity = 0.28 + (Math.sin(clock.elapsedTime * 8) * 0.5 + 0.5) * 0.12
  })

  return (
    <mesh ref={ref} visible={false}>
      <cylinderGeometry args={[r * 1.04, r * 1.04, h * 1.04, 18]} />
      <meshBasicMaterial color="#dc2626" transparent opacity={0.32} depthWrite={false} />
    </mesh>
  )
}

export default function SceneObjects() {
  const scene = useAtomValue(sceneGraphAtom)
  const setSceneGraph = useSetAtom(sceneGraphAtom)
  const currentFrame = useAtomValue(currentSimFrameAtom)
  const frameNumber = useAtomValue(currentFrameAtom)
  const baselineObjectStates = useAtomValue(simBaselineObjectStatesAtom)

  const frameRef = useRef(currentFrame)
  frameRef.current = currentFrame

  const bodyRefs = useRef<Map<string, RigidBodyApi>>(new Map())
  const prevHeldIdRef = useRef<string | null>(null)
  const gripOffsetRef = useRef<[number, number, number]>([0, 0, 0])
  const lastSceneSyncRef = useRef(0)

  const applyObjectBaseline = (body: RigidBodyApi, baseline: SimObjectBaseline) => {
    const [x, y, z] = baseline.position
    const [qx, qy, qz, qw] = baseline.rotation
    const [sx, sy, sz] = baseline.scale

    const scalableBody = body as RigidBodyApi & {
      setScale?: (scale: { x: number; y: number; z: number }, wakeUp?: boolean) => void
    }

    if (typeof scalableBody.setScale === 'function') {
      scalableBody.setScale({ x: sx, y: sy, z: sz }, true)
    }

    body.setTranslation({ x, y, z }, true)
    body.setRotation(new Quaternion(qx, qy, qz, qw), true)
    body.setLinvel({ x: 0, y: 0, z: 0 }, true)
    body.setAngvel({ x: 0, y: 0, z: 0 }, true)
  }

  useEffect(() => {
    if (frameNumber !== 0) return

    prevHeldIdRef.current = null
    gripOffsetRef.current = [0, 0, 0]

    const hasBaseline = Object.keys(baselineObjectStates).length > 0

    for (const obj of scene.objects) {
      const body = bodyRefs.current.get(obj.id)
      if (!body) continue

      const baseline = baselineObjectStates[obj.id]
      const resetBaseline: SimObjectBaseline = baseline ?? {
        position: obj.position,
        rotation: [0, 0, 0, 1],
        scale: obj.scale ?? [1, 1, 1],
      }
      applyObjectBaseline(body, resetBaseline)
    }

    if (hasBaseline) {
      setSceneGraph((prev) => ({
        ...prev,
        objects: prev.objects.map((obj) => {
          const reset = baselineObjectStates[obj.id]
          return reset ? { ...obj, position: reset.position, scale: reset.scale } : obj
        }),
      }))
    }
  }, [frameNumber, baselineObjectStates, scene.objects, setSceneGraph])

  useFrame(({ clock }) => {
    const hasBaseline = Object.keys(baselineObjectStates).length > 0

    if (frameNumber === 0 && hasBaseline) {
      // Hold baseline pose at frame 0 so resting physics cannot drift objects
      // (e.g. cylinder rolling sideways) before next run.
      for (const obj of scene.objects) {
        const baseline = baselineObjectStates[obj.id]
        const body = bodyRefs.current.get(obj.id)
        if (!baseline || !body) continue

        applyObjectBaseline(body, baseline)
      }
      return
    }

    const frame = frameRef.current
    const currentHeld = frame?.heldObjectId ?? null

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

    if (currentHeld !== prevHeldIdRef.current) {
      if (currentHeld && frame?.heldObjectPos) {
        const body = bodyRefs.current.get(currentHeld)
        if (body) {
          const actual = body.translation()
          const [bx, by, bz] = frame.heldObjectPos
          gripOffsetRef.current = [actual.x - bx, actual.y - by, actual.z - bz]
        } else {
          gripOffsetRef.current = [0, 0, 0]
        }
      } else {
        gripOffsetRef.current = [0, 0, 0]
      }

      prevHeldIdRef.current = currentHeld
    }

    if (currentHeld && frame?.heldObjectPos) {
      const body = bodyRefs.current.get(currentHeld)
      if (body) {
        const [bx, by, bz] = frame.heldObjectPos
        const [ox, oy, oz] = gripOffsetRef.current

        body.setTranslation({ x: bx + ox, y: by + oy, z: bz + oz }, true)
        body.setLinvel({ x: 0, y: 0, z: 0 }, false)
        body.setAngvel({ x: 0, y: 0, z: 0 }, false)
      }
    }

    // Publish dynamic-object positions back to shared scene state for AI grounding.
    const now = clock.elapsedTime
    if (now - lastSceneSyncRef.current < 0.14) return
    lastSceneSyncRef.current = now

    const updates = new Map<string, [number, number, number]>()
    for (const obj of scene.objects) {
      const body = bodyRefs.current.get(obj.id)
      if (!body) continue
      const t = body.translation()
      const next: [number, number, number] = [
        Number(t.x.toFixed(4)),
        Number(t.y.toFixed(4)),
        Number(t.z.toFixed(4)),
      ]

      const [ox, oy, oz] = obj.position
      const dx = Math.abs(next[0] - ox)
      const dy = Math.abs(next[1] - oy)
      const dz = Math.abs(next[2] - oz)
      if (dx > 0.002 || dy > 0.002 || dz > 0.002) {
        updates.set(obj.id, next)
      }
    }

    if (updates.size === 0) return

    setSceneGraph((prev) => ({
      ...prev,
      objects: prev.objects.map((obj) => {
        const next = updates.get(obj.id)
        return next ? { ...obj, position: next } : obj
      }),
    }))
  })

  return (
    <>
      {scene.objects.map((obj) => {
        const [w, h, d] = obj.dimensions
        const [x, y, z] = obj.position
        const color = obj.color ?? '#c8b89a'
        const isCollisionTarget =
          currentFrame?.isCollision && currentFrame.collidingObjectId === obj.id

        if (obj.type === 'surface') {
          return (
            <RigidBody key={obj.id} type="fixed" position={[x, y, z]} colliders={false}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color={isCollisionTarget ? '#dc2626' : color} roughness={0.75} metalness={0} />
              </mesh>
              <CollisionHaloBox w={w} h={h} d={d} active={Boolean(isCollisionTarget)} />
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
                <meshStandardMaterial color={isCollisionTarget ? '#dc2626' : color} roughness={0.6} metalness={0.05} />
              </mesh>
              <CollisionHaloBox w={w} h={h} d={d} active={Boolean(isCollisionTarget)} />
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
                <meshStandardMaterial color={isCollisionTarget ? '#dc2626' : color} roughness={0.5} metalness={0.1} />
              </mesh>
              <CollisionHaloCylinder r={w / 2} h={h} active={Boolean(isCollisionTarget)} />
              <CylinderCollider args={[h / 2, w / 2]} restitution={0.05} friction={0.7} />
            </RigidBody>
          )
        }

        if (obj.type === 'zone') {
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

      {scene.targetZones.map((zone) => (
        <mesh key={zone.id} position={zone.position} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[zone.radius * 0.7, zone.radius, 24]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.5} depthWrite={false} side={2} />
        </mesh>
      ))}
    </>
  )
}