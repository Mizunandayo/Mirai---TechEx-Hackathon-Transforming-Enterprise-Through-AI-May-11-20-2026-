import type { Node, Edge } from '@xyflow/react'
import type { TaskBlock, MoveBlock } from '../types/task'
import type { SceneGraph } from '../types/task'
import type { ArmSegment } from '../types/arm'
import type { SimFrame, ExecutionPlan } from '../types/simulation'
import {
  forwardKinematics,
  getHomeState,
  lerpAngles,
  easeInOut,
  lerp,
  clampPitchAngles,
} from './forwardKinematics'
import { solveIK } from './inverseKinematics'
import { computeTransitHeight } from './scenePlanner'

// Constraints
const FPS = 60
const FRAME_DT_MS = 1000 / FPS
const BASE_MOVE_FRAMES = 90
const MIN_MOVE_FRAMES = 12
const GRIP_HOLD_FRAMES = 20
const POINT_COLLISION_MARGIN = 0.02
// ── Volumetric arm geometry constants ─────────────────────────────────────────
// These match the VISUAL geometry of the robotic arm model in RobotArm.tsx.
// The old 2.2 cm radius only checked the center-line axis of each link,
// missing collisions where the link BODY (4-5 cm wide) contacted an obstacle.
const LINK_COLLISION_RADIUS = 0.045   // arm link body half-width ~4.5 cm
const JOINT_HOUSING_RADIUS  = 0.065   // joint disk housing radius  ~6.5 cm
const LINK_COLLISION_SAMPLES = 32     // denser sampling for better link coverage
const GRAB_RANGE = 0.18

// Lateral-move threshold: XZ displacement must exceed this to be considered "lateral"
const LATERAL_THRESHOLD = 0.05
// Minimum margin below transit height before we enforce via-points
const TRANSIT_CLAMP_SLACK = 0.04

// ── Via-point enforcer ────────────────────────────────────────────────────────
//
// Ensures that lateral arm motion never occurs below the scene's safe transit
// height. Any move that changes XZ by more than LATERAL_THRESHOLD while its
// target Y is below (transitHeight - TRANSIT_CLAMP_SLACK) is automatically
// decomposed into three collision-safe sub-moves:
//
//   1. Rise   — straight up from current position to transit height
//   2. Transit — lateral at transit height to above the destination
//   3. Descend — straight down to the intended target
//
// This is the last-resort safety net. With good AI prompts the sequence should
// already follow this pattern, but if Gemini or the fallback planner deviate
// even slightly, this catches it deterministically at compile time.

interface ViaSegment {
  target: [number, number, number]
  framesCount: number
}

function planMoveViapoints(
  rawTarget: [number, number, number],
  fromEE: [number, number, number],
  totalFrames: number,
  transitH: number,
): ViaSegment[] {
  const [tx, ty, tz] = rawTarget
  const [fx, , fz] = fromEE

  const dx = tx - fx
  const dz = tz - fz
  const lateralDist = Math.sqrt(dx * dx + dz * dz)

  const isLateral = lateralDist > LATERAL_THRESHOLD
  const isBelowTransit = ty < transitH - TRANSIT_CLAMP_SLACK

  if (!isLateral || !isBelowTransit) {
    // Safe as-is: direct move
    return [{ target: rawTarget, framesCount: totalFrames }]
  }

  // Decompose into rise → transit → descend
  const fromY = fromEE[1]
  const riseTarget:    [number, number, number] = [fx, Math.max(fromY, transitH), fz]
  const transitTarget: [number, number, number] = [tx, transitH, tz]
  const descendTarget: [number, number, number] = rawTarget

  // Distribute frames proportionally to distance traveled
  const riseDist    = Math.abs(transitH - fromY)
  const transitDist = lateralDist
  const descendDist = Math.abs(transitH - ty)
  const totalDist = Math.max(riseDist + transitDist + descendDist, 0.01)

  const segFrames = (dist: number) =>
    Math.max(MIN_MOVE_FRAMES, Math.round((dist / totalDist) * totalFrames))

  return [
    { target: riseTarget,    framesCount: segFrames(riseDist) },
    { target: transitTarget, framesCount: segFrames(transitDist) },
    { target: descendTarget, framesCount: segFrames(descendDist) },
  ]
}

// Target resolver
const JAW_CENTER_OFFSET = 0.05

function resolveTarget(block: MoveBlock, scene: SceneGraph): [number, number, number] {
  const { x, y, z, targetId } = block.params

  // Explicit coordinates ALWAYS take priority over scene-object lookup.
  // AI-generated and scene-planner waypoints encode collision-free heights
  // (approachHover at transitH, gripPoint at gripY, liftPoint at transitH, etc.).
  // If we override them with the scene object's position we lose all safe heights
  // and the arm travels laterally at table height → guaranteed massive collisions.
  // Only fall back to scene lookup when no meaningful coordinates are provided
  // (e.g. a Move node the user placed manually with just a target and no coords).
  const hasExplicitCoords = Math.abs(x) > 0.0005 || Math.abs(y) > 0.0005 || Math.abs(z) > 0.0005
  if (hasExplicitCoords) {
    return [x, y, z]
  }

  // No explicit coords → look up from scene (manual task-editor nodes)
  if (targetId) {
    const obj = scene.objects.find((o) => o.id === targetId)
    if (obj) {
      return [obj.position[0], obj.position[1] + JAW_CENTER_OFFSET, obj.position[2]]
    }
    const zone = scene.targetZones.find((z) => z.id === targetId)
    if (zone) return zone.position as [number, number, number]
  }

  return [x, y, z]
}

// Graph traversal
function buildLinearSequence(
  nodes: Node<TaskBlock>[],
  edges: Edge[],
): Node<TaskBlock>[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]))
  const adj = new Map<string, string[]>()

  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, [])
    if (e.sourceHandle === 'else') {
      adj.get(e.source)!.push(e.target)
    } else {
      adj.get(e.source)!.unshift(e.target)
    }
  }

  const seq: Node<TaskBlock>[] = []
  const visited = new Set<string>()
  let currentId = nodes.find((n) => n.data.kind === 'start')?.id

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId)
    const node = nodeMap.get(currentId)
    if (!node) break
    seq.push(node)
    if (node.data.kind === 'end') break
    currentId = (adj.get(currentId) ?? [])[0]
  }

  return seq
}

// Collision checks
function pointToAABBDistanceSq(
  point: [number, number, number],
  center: [number, number, number],
  half: [number, number, number],
): number {
  const dx = Math.max(Math.abs(point[0] - center[0]) - half[0], 0)
  const dy = Math.max(Math.abs(point[1] - center[1]) - half[1], 0)
  const dz = Math.max(Math.abs(point[2] - center[2]) - half[2], 0)
  return dx * dx + dy * dy + dz * dz
}

function segmentToAABBDistanceSq(
  start: [number, number, number],
  end: [number, number, number],
  center: [number, number, number],
  half: [number, number, number],
): number {
  let best = Number.POSITIVE_INFINITY

  for (let i = 0; i <= LINK_COLLISION_SAMPLES; i++) {
    const t = i / LINK_COLLISION_SAMPLES
    const sample: [number, number, number] = [
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
      start[2] + (end[2] - start[2]) * t,
    ]
    const d2 = pointToAABBDistanceSq(sample, center, half)
    if (d2 < best) best = d2
    if (best <= 0) break
  }

  return best
}

function checkAABBCollision(
  point: [number, number, number],
  scene: SceneGraph,
  ignoreId?: string,
): string | null {
  for (const obj of scene.objects) {
    if (obj.type === 'zone') continue
    if (obj.id === ignoreId) continue

    const [ox, oy, oz] = obj.position
    const half: [number, number, number] = [
      obj.dimensions[0] / 2 + POINT_COLLISION_MARGIN,
      obj.dimensions[1] / 2 + POINT_COLLISION_MARGIN,
      obj.dimensions[2] / 2 + POINT_COLLISION_MARGIN,
    ]

    if (pointToAABBDistanceSq(point, [ox, oy, oz], half) <= 0) {
      return obj.id
    }
  }

  return null
}

/**
 * Check spherical volumes at each JOINT HOUSING position.
 *
 * Joint housings (the disk-shaped connectors at each articulated joint)
 * are wider than the link bodies — roughly 6-7 cm in diameter.
 * The center-line sampler misses these completely because it only sweeps
 * the 1-D axis between joint positions, not the volume at each joint.
 *
 * We check every joint from index 1 onward (the top of the base segment
 * is the first joint that could contact scene objects; index 0 is the
 * ground anchor at the arm origin).
 *
 * NOTE: Surface objects are intentionally excluded here — the lower joints
 * are always near the table surface level, and surfaces use `checkAABBCollision`
 * (EE point check) for deposit / pick operations. Only discrete obstacles
 * (boxes, cylinders) are meaningful collision targets for joint housings.
 */
function checkJointHousings(
  jointPositions: [number, number, number][],
  scene: SceneGraph,
  ignoreId?: string,
): { objectId: string; jointIndex: number } | null {
  for (let ji = 1; ji < jointPositions.length; ji++) {
    const jp = jointPositions[ji]
    if (!jp) continue

    for (const obj of scene.objects) {
      if (obj.type === 'zone') continue
      // Skip ONLY the work table — the arm mounts on it, joint-vs-table
      // contact is geometrically impossible. Every other surface (the elevated
      // shelf, etc.) is a real obstacle joint housings can collide with.
      if (obj.type === 'surface' && obj.id === 'table') continue
      if (obj.id === ignoreId) continue

      const [ox, oy, oz] = obj.position
      const half: [number, number, number] = [
        obj.dimensions[0] / 2 + JOINT_HOUSING_RADIUS,
        obj.dimensions[1] / 2 + JOINT_HOUSING_RADIUS,
        obj.dimensions[2] / 2 + JOINT_HOUSING_RADIUS,
      ]

      if (pointToAABBDistanceSq(jp, [ox, oy, oz], half) <= 0) {
        return { objectId: obj.id, jointIndex: ji }
      }
    }
  }
  return null
}

function checkArmLinkCollision(
  segments: ArmSegment[],
  jointPositions: [number, number, number][],
  scene: SceneGraph,
  ignoreId?: string,
): { objectId: string; linkIndex: number } | null {
  const linkRadiusSq = LINK_COLLISION_RADIUS * LINK_COLLISION_RADIUS

  for (let segIndex = 0; segIndex < segments.length; segIndex++) {
    const seg = segments[segIndex]
    if (seg.joint === 'fixed') continue

    const start = jointPositions[segIndex]
    const end = jointPositions[segIndex + 1]
    if (!start || !end) continue

    for (const obj of scene.objects) {
      if (obj.type === 'zone') continue
      if (obj.id === ignoreId) continue
      // Skip ONLY the work table — the arm base sits on it so link-vs-table
      // contact is geometrically impossible. Elevated surfaces (shelf at Y=0.3)
      // ARE real obstacles: arm links can and do pass through them during poor
      // trajectories and must be detected.
      if (obj.type === 'surface' && obj.id === 'table') continue

      const [ox, oy, oz] = obj.position
      const half: [number, number, number] = [
        obj.dimensions[0] / 2 + POINT_COLLISION_MARGIN,
        obj.dimensions[1] / 2 + POINT_COLLISION_MARGIN,
        obj.dimensions[2] / 2 + POINT_COLLISION_MARGIN,
      ]

      const distSq = segmentToAABBDistanceSq(start, end, [ox, oy, oz], half)
      if (distSq <= linkRadiusSq) {
        return { objectId: obj.id, linkIndex: segIndex }
      }
    }
  }

  return null
}

// Metrics estimation
function estimateTorques(segments: ArmSegment[], pitchAngles: number[]): number[] {
  const revolve = segments.filter((s) => s.joint !== 'fixed')
  let cumPitch = 0

  return revolve.map((seg, i) => {
    cumPitch += pitchAngles[i] ?? 0
    return parseFloat(
      (seg.mass * 9.81 * seg.length * Math.abs(Math.sin((cumPitch * Math.PI) / 180))).toFixed(3),
    )
  })
}

function estimateVelocities(
  prev: number[] | null,
  curr: number[],
  dtS: number,
): number[] {
  if (!prev || dtS < 1e-9) return curr.map(() => 0)

  return curr.map((a, i) =>
    parseFloat((Math.abs(a - (prev[i] ?? a)) / dtS).toFixed(2)),
  )
}

// Arm config hash
export function armConfigHash(segments: ArmSegment[]): string {
  return segments
    .map((s) => `${s.id}:${s.length.toFixed(3)}:${s.mass.toFixed(2)}:${s.joint}`)
    .join('|')
}

// Main compiler
export function compileTask(
  nodes: Node<TaskBlock>[],
  edges: Edge[],
  segments: ArmSegment[],
  scene: SceneGraph,
  taskName: string,
): ExecutionPlan | null {
  const startNode = nodes.find((n) => n.data.kind === 'start')
  if (!startNode || nodes.length < 2) return null

  const sequence = buildLinearSequence(nodes, edges)
  if (sequence.length < 1) return null

  // Compute scene-wide safe transit height once — used for via-point enforcement
  const transitH = computeTransitHeight(scene)

  const home = getHomeState(segments)
  let currentPitch = [...home.pitchAngles]
  let currentYaw = 0
  let gripperOpen = true
  let gripperForce = 0
  let heldObjectId: string | null = null
  let heldObjectOffset: [number, number, number] | null = null
  let approachTargetId: string | null = null

  const frames: SimFrame[] = []
  let frameIndex = 0
  let timeMs = 0
  let prevPitch: number[] | null = null

  const pushFrame = (overrides?: Partial<SimFrame>) => {
    const safePitch = clampPitchAngles(segments, currentPitch)
    const fk = forwardKinematics(segments, safePitch, currentYaw)
    const torques = estimateTorques(segments, safePitch)
    const velocities = estimateVelocities(prevPitch, safePitch, FRAME_DT_MS / 1000)

    const ignoreId = heldObjectId ?? approachTargetId ?? undefined

    // Volumetric collision detection — three layers covering the full arm geometry:
    // 1. Joint housings (spheres at each articulated joint, 6.5 cm radius)
    // 2. Link bodies   (swept capsule along each segment, 4.5 cm radius, 32 samples)
    // 3. End-effector  (point check at tool tip with 2 cm margin)
    const jointHit = checkJointHousings(fk.jointPositions, scene, ignoreId)
    const linkHit  = jointHit
      ? { objectId: jointHit.objectId, linkIndex: Math.max(0, jointHit.jointIndex - 1) }
      : checkArmLinkCollision(segments, fk.jointPositions, scene, ignoreId)
    const eeHitId = linkHit ? null : checkAABBCollision(fk.endEffector, scene, ignoreId)

    const heldObjectPos: [number, number, number] | undefined =
      heldObjectId && heldObjectOffset
        ? [
            fk.endEffector[0] + heldObjectOffset[0],
            fk.endEffector[1] + heldObjectOffset[1],
            fk.endEffector[2] + heldObjectOffset[2],
          ]
        : undefined

    frames.push({
      frameIndex: frameIndex++,
      timeMs,
      waistYawDeg: currentYaw,
      pitchAngles: [...safePitch],
      gripperOpen,
      gripperForce,
      endEffectorPos: fk.endEffector,
      isCollision: Boolean(linkHit || eeHitId),
      collidingObjectId: linkHit?.objectId ?? eeHitId ?? undefined,
      collidingLinkIndex: linkHit?.linkIndex,
      heldObjectId: heldObjectId ?? undefined,
      heldObjectPos,
      approachTargetId: approachTargetId ?? undefined,
      jointTorques: torques,
      jointVelocities: velocities,
      ...overrides,
    })

    prevPitch = [...safePitch]
    timeMs += FRAME_DT_MS
  }

  for (const node of sequence) {
    const block = node.data

    if (block.kind === 'start' || block.kind === 'end') {
      for (let f = 0; f < 30; f++) pushFrame()
      continue
    }

    if (block.kind === 'move') {
      if (block.params.targetId) {
        const approachObj = scene.objects.find(
          (o) => o.id === block.params.targetId && o.type !== 'surface' && o.type !== 'zone',
        )
        approachTargetId = approachObj?.id ?? null
      } else {
        approachTargetId = null
      }

      const target = resolveTarget(block, scene)

      if (!approachTargetId) {
        let nearestId: string | null = null
        let nearestDist = GRAB_RANGE

        for (const obj of scene.objects) {
          if (obj.type === 'surface' || obj.type === 'zone') continue
          const dx = target[0] - obj.position[0]
          const dy = target[1] - obj.position[1]
          const dz = target[2] - obj.position[2]
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist < nearestDist) {
            nearestDist = dist
            nearestId = obj.id
          }
        }

        approachTargetId = nearestId
      }

      const totalFrames = Math.max(
        MIN_MOVE_FRAMES,
        Math.round(BASE_MOVE_FRAMES / Math.max(0.05, block.params.speed)),
      )

      // Compute current EE position for lateral-move detection
      const currentFK = forwardKinematics(segments, clampPitchAngles(segments, currentPitch), currentYaw)
      const viaSegments = planMoveViapoints(target, currentFK.endEffector, totalFrames, transitH)

      for (const seg of viaSegments) {
        const ik = solveIK(segments, seg.target)
        const startPitch = [...currentPitch]
        const startYaw = currentYaw

        for (let f = 0; f < seg.framesCount; f++) {
          const t = easeInOut(f / Math.max(seg.framesCount - 1, 1))
          currentPitch = lerpAngles(startPitch, ik.pitchAngles, t)
          currentYaw = lerp(startYaw, ik.waistYawDeg, t)
          pushFrame()
        }

        currentPitch = [...ik.pitchAngles]
        currentYaw = ik.waistYawDeg
      }

      approachTargetId = null
      continue
    }

    if (block.kind === 'grip') {
      gripperOpen = block.params.action === 'open'
      gripperForce = block.params.action === 'close' ? block.params.force : 0

      if (block.params.action === 'close') {
        const safePitch = clampPitchAngles(segments, currentPitch)
        const fk = forwardKinematics(segments, safePitch, currentYaw)
        const ee = fk.endEffector

        let bestId: string | null = null
        let bestDist = GRAB_RANGE
        let bestOffset: [number, number, number] = [0, 0, 0]

        for (const obj of scene.objects) {
          if (obj.type === 'surface' || obj.type === 'zone') continue
          const dx = obj.position[0] - ee[0]
          const dy = obj.position[1] - ee[1]
          const dz = obj.position[2] - ee[2]
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

          if (dist < bestDist) {
            bestDist = dist
            bestId = obj.id
            bestOffset = [dx, dy, dz]
          }
        }

        heldObjectId = bestId
        heldObjectOffset = bestId ? bestOffset : null
      } else {
        heldObjectId = null
        heldObjectOffset = null
      }

      const emptyGrip = block.params.action === 'close' && heldObjectId === null
      for (let f = 0; f < GRIP_HOLD_FRAMES; f++) {
        pushFrame(emptyGrip ? { gripEmpty: true } : undefined)
      }
      continue
    }

    if (block.kind === 'wait') {
      const waitFrames = Math.max(1, Math.round(block.params.durationMs / FRAME_DT_MS))
      for (let f = 0; f < Math.min(waitFrames, 600); f++) pushFrame()
      continue
    }

    if (block.kind === 'loop') {
      const loopFrames = Math.min(block.params.count, 20) * 18
      for (let f = 0; f < loopFrames; f++) pushFrame()
      continue
    }
  }

  return {
    frames,
    totalFrames: frames.length,
    durationMs: timeMs,
    fps: FPS,
    taskName,
    armConfigHash: armConfigHash(segments),
  }
}