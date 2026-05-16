/**
 * Scene-aware safe trajectory planner.
 *
 * Computes provably collision-free waypoints from scene AABB geometry.
 * Single source of truth for safe heights used by:
 *   - Gemini prompt context (rich scene descriptions with computed safe coords)
 *   - Deterministic fallback planner (always collision-free pick-and-place)
 *   - TaskEditorPanel (replaces ad-hoc guesses)
 */

import type { SceneGraph, SceneObject, TargetZone } from '../types/task'
import type { GripperConfig } from '../types/arm'

// ── Safety margins (tuned for default scene geometry) ─────────────────────────
// TRANSIT_MARGIN raised to 0.22m: arm links (not just end-effector) must clear
// the shelf (top Y=0.31m). With total arm ~0.78m, the elbow can dip ~0.15m
// below the end-effector during long reaches. 0.22m clears that + 7cm safety.
const TRANSIT_MARGIN   = 0.22   // above tallest obstacle for lateral travel
const APPROACH_MARGIN  = 0.16   // hover above object before descending
const GRIP_MARGIN      = 0.03   // above object top surface for gripper contact
const PLACE_MARGIN     = 0.04   // above destination surface for deposit

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ObjectSafetyInfo {
  id: string
  name: string
  type: string
  position: [number, number, number]
  dimensions: [number, number, number]
  topY: number        // top of bounding box
  approachY: number   // safe hover before descending
  gripY: number       // Y for gripper contact
}

export interface DestinationInfo {
  id: string
  name: string
  position: [number, number, number]
  placeY: number    // Y to deposit object
  hoverY: number    // Y to hover before lowering
}

export interface SafePickSequence {
  transitHeight: number
  approachHover: [number, number, number]   // above pickup, at transit height
  gripPoint: [number, number, number]        // descend to grip
  liftPoint: [number, number, number]        // lift back to transit height
  destHover: [number, number, number]        // transit to above destination
  depositPoint: [number, number, number]     // lower to deposit height
  retreatPoint: [number, number, number]     // lift away after release
  pickObjectId: string
  destinationId: string
}

// ── Core geometry helpers ─────────────────────────────────────────────────────

function topYOf(obj: SceneObject): number {
  return obj.position[1] + obj.dimensions[1] / 2
}

/** Global safe transit height — clears every non-zone object with margin. */
export function computeTransitHeight(scene: SceneGraph): number {
  const maxTop = scene.objects
    .filter(o => o.type !== 'zone')
    .reduce((max, o) => Math.max(max, topYOf(o)), 0.05)
  return parseFloat((maxTop + TRANSIT_MARGIN).toFixed(3))
}

/** Per-object safety envelope. */
export function computeAllObjectSafetyInfo(scene: SceneGraph): ObjectSafetyInfo[] {
  return scene.objects
    .filter(o => o.type !== 'zone')
    .map(o => {
      const top = topYOf(o)
      return {
        id: o.id,
        name: o.name,
        type: o.type,
        position: o.position as [number, number, number],
        dimensions: o.dimensions as [number, number, number],
        topY: parseFloat(top.toFixed(3)),
        approachY: parseFloat((top + APPROACH_MARGIN).toFixed(3)),
        gripY: parseFloat((top + GRIP_MARGIN).toFixed(3)),
      }
    })
}

/** Destination surface or zone info. */
export function getDestinationInfo(destId: string, scene: SceneGraph): DestinationInfo | null {
  const obj = scene.objects.find(o => o.id === destId)
  if (obj) {
    const top = topYOf(obj)
    return {
      id: obj.id,
      name: obj.name,
      position: obj.position as [number, number, number],
      placeY: parseFloat((top + PLACE_MARGIN).toFixed(3)),
      hoverY: parseFloat((top + APPROACH_MARGIN).toFixed(3)),
    }
  }

  const zone = scene.targetZones.find(z => z.id === destId)
  if (zone) {
    const [x, y, z] = zone.position
    return {
      id: zone.id,
      name: zone.name,
      position: [x, y, z],
      placeY: parseFloat((y + PLACE_MARGIN).toFixed(3)),
      hoverY: parseFloat((y + APPROACH_MARGIN).toFixed(3)),
    }
  }

  return null
}

// ── Safe trajectory computation ───────────────────────────────────────────────

/**
 * Compute provably collision-free pick-and-place waypoints.
 * All lateral moves happen at transitHeight (above every scene obstacle).
 * Descents happen only directly above the target.
 */
export function computeSafePickSequence(
  pickObjectId: string,
  destinationId: string,
  scene: SceneGraph,
): SafePickSequence | null {
  const pickObj = scene.objects.find(o => o.id === pickObjectId)
  if (!pickObj) return null

  const dest = getDestinationInfo(destinationId, scene)
  if (!dest) return null

  const transit = computeTransitHeight(scene)
  const pickTop = topYOf(pickObj)
  const gripY = parseFloat((pickTop + GRIP_MARGIN).toFixed(3))

  return {
    transitHeight: transit,
    approachHover:  [pickObj.position[0], transit,  pickObj.position[2]],
    gripPoint:      [pickObj.position[0], gripY,     pickObj.position[2]],
    liftPoint:      [pickObj.position[0], transit,   pickObj.position[2]],
    destHover:      [dest.position[0],    transit,   dest.position[2]],
    depositPoint:   [dest.position[0],    dest.placeY, dest.position[2]],
    retreatPoint:   [dest.position[0],    transit,   dest.position[2]],
    pickObjectId,
    destinationId,
  }
}

// ── Rich scene context for Gemini ─────────────────────────────────────────────

/**
 * Build structured scene context strings that include computed safe heights.
 * Replaces the raw position-only strings previously sent to the backend.
 * The backend parses these to build explicit safe-waypoint prompts for Gemini.
 */
export function buildRichSceneContext(scene: SceneGraph): string[] {
  const transit = computeTransitHeight(scene)
  const safety = computeAllObjectSafetyInfo(scene)

  const lines: string[] = [
    `SAFE_TRANSIT_HEIGHT=${transit.toFixed(3)} (ALL lateral moves must use this Y or higher)`,
  ]

  for (const info of safety) {
    const [x, y, z] = info.position
    const [w, h, d] = info.dimensions
    lines.push(
      `${info.name} (${info.id}) type=${info.type}` +
      ` center=(${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)})` +
      ` size=(${w.toFixed(3)},${h.toFixed(3)},${d.toFixed(3)})` +
      ` topY=${info.topY.toFixed(3)}` +
      ` approachY=${info.approachY.toFixed(3)}` +
      ` gripY=${info.gripY.toFixed(3)}`
    )
  }

  for (const zone of scene.targetZones) {
    const [x, y, z] = zone.position
    lines.push(
      `${zone.name} (${zone.id}) zone` +
      ` center=(${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)})` +
      ` radius=${zone.radius.toFixed(3)}` +
      ` placeY=${(y + PLACE_MARGIN).toFixed(3)}`
    )
  }

  return lines
}

// ── Object / destination resolution from natural language ─────────────────────

/** Find the most relevant pickable object referenced in user input. */
export function findPickableObject(input: string, scene: SceneGraph): SceneObject | null {
  const text = input.toLowerCase()
  const pickable = scene.objects.filter(
    o => o.type === 'box' || o.type === 'cylinder' || o.type === 'sphere',
  )

  const explicit = pickable.find(
    o => text.includes(o.name.toLowerCase()) || text.includes(o.id.toLowerCase()),
  )
  if (explicit) return explicit

  const shorthand = text.match(/(box|cylinder|sphere)\s*-?\s*([a-z])/i)
  if (shorthand) {
    const kind = shorthand[1].toLowerCase()
    const suffix = shorthand[2].toLowerCase()
    const found = pickable.find(o => o.id.toLowerCase().includes(`${kind}-${suffix}`))
    if (found) return found
  }

  return pickable[0] ?? null
}

/** Find best destination referenced in user input. */
export function findDestination(
  input: string,
  pickObjectId: string,
  scene: SceneGraph,
): string | null {
  const text = input.toLowerCase()

  // Zone keyword table (most specific first)
  const zoneKeywords: [string, string][] = [
    ['shelf', 'zone-shelf'],
    ['drawer', 'zone-drawer'],
    ['center', 'zone-table-center'],
    ['table center', 'zone-table-center'],
  ]
  for (const [keyword, zoneId] of zoneKeywords) {
    if (text.includes(keyword)) {
      if (scene.targetZones.find(z => z.id === zoneId)) return zoneId
    }
  }

  // Fuzzy zone name match
  for (const zone of scene.targetZones) {
    if (text.includes(zone.name.toLowerCase()) || text.includes(zone.id.toLowerCase())) {
      return zone.id
    }
  }

  // Surface object match
  for (const obj of scene.objects) {
    if (obj.type !== 'surface' || obj.id === pickObjectId) continue
    if (text.includes(obj.name.toLowerCase()) || text.includes(obj.id.toLowerCase())) {
      return obj.id
    }
  }

  // Default: first zone → first non-table surface
  return (
    scene.targetZones[0]?.id ??
    scene.objects.find(o => o.type === 'surface' && o.id !== 'table')?.id ??
    null
  )
}

// ── Obstacle-aware approach planner ─────────────────────────────────────────

/**
 * Determine if a pickup approach path would collide with an elevated surface.
 * The shelf sits at Y≈0.3 and its footprint blocks the arm when it descends
 * from transit height to approach the pickup object below the shelf edge.
 *
 * Returns a safe intermediate Z position outside the surface footprint,
 * or null when the direct approach is clear.
 */
export function computeObstacleAwareApproach(
  pickObj: SceneObject,
  scene: SceneGraph,
): { needsAvoidance: boolean; safeApproachZ: number; blockingSurface: string | null } {
  const [px, , pz] = pickObj.position
  const MARGIN = 0.06   // approach margin beyond surface edge

  for (const obj of scene.objects) {
    if (obj.type !== 'surface') continue
    if (obj.id === 'table') continue   // floor-level table — arm is mounted on/above it

    const [sx, , sz] = obj.position
    const [sw, , sd]  = obj.dimensions
    const halfX = sw / 2 + 0.02
    const halfZ = sd / 2 + 0.02

    // Does the pickup X fall inside this surface's X footprint?
    const xOverlap = Math.abs(px - sx) <= halfX
    // Is the pickup Z at or inside this surface's Z footprint?
    const zOverlap = Math.abs(pz - sz) <= halfZ

    if (xOverlap && zOverlap) {
      // Pickup is UNDER the surface or at its edge → arm approach blocked.
      // Safe Z = front face of surface minus MARGIN (arm comes from the front).
      const surfaceFrontZ = sz - sd / 2   // Z of the nearer face toward negative Z
      const safeZ = surfaceFrontZ - MARGIN
      return { needsAvoidance: true, safeApproachZ: parseFloat(safeZ.toFixed(3)), blockingSurface: obj.id }
    }
  }

  return { needsAvoidance: false, safeApproachZ: pz, blockingSurface: null }
}

/**
 * Task feasibility analysis: can the arm complete the FULL task (pickup + deposit)?
 * Returns a structured report with specific failure reasons.
 */
export interface TaskFeasibilityReport {
  pickupFeasible: boolean
  depositFeasible: boolean
  fullyFeasible: boolean
  pickupBlockedBy: string | null    // surface id if blocked by obstacle
  depositDistance: number
  maxReach: number
  errorMessage: string | null
}

export function analyzeTaskFeasibility(
  pickObjectId: string,
  destinationId: string,
  segments: { joint: string; length: number }[],
  scene: SceneGraph,
): TaskFeasibilityReport {
  const pickObj  = scene.objects.find(o => o.id === pickObjectId)
  const destZone = scene.targetZones.find(z => z.id === destinationId)
  const destObj  = scene.objects.find(o => o.id === destinationId)

  const totalLen = segments.reduce((s, seg) => s + seg.length, 0)
  const maxReach = totalLen * 1.1

  // Check pickup obstacle
  const approachCheck = pickObj ? computeObstacleAwareApproach(pickObj, scene) : { needsAvoidance: false, blockingSurface: null, safeApproachZ: 0 }
  const pickupFeasible = Boolean(pickObj)

  // Check deposit reachability
  const destPos: [number, number, number] = destZone
    ? destZone.position as [number, number, number]
    : destObj ? destObj.position as [number, number, number] : [0, 0, 0]
  const [dx, dy, dz] = destPos
  const depositDistance = Math.sqrt(dx * dx + dy * dy + dz * dz)
  const depositFeasible = depositDistance <= maxReach

  let errorMessage: string | null = null

  if (!pickupFeasible) {
    errorMessage = `Pickup object "${pickObjectId}" not found in scene.`
  } else if (approachCheck.needsAvoidance && !depositFeasible) {
    errorMessage =
      `Task is infeasible: arm can pick up ${pickObj!.name} using obstacle-aware routing ` +
      `(avoids ${approachCheck.blockingSurface}), but CANNOT reach the drop zone — ` +
      `${(depositDistance * 1000).toFixed(0)}mm away, max reach ${(maxReach * 1000).toFixed(0)}mm. ` +
      `Increase segment lengths in the Design tab.`
  } else if (!depositFeasible) {
    errorMessage =
      `Arm can reach ${pickObj!.name} for pickup, but CANNOT reach the deposit zone — ` +
      `${(depositDistance * 1000).toFixed(0)}mm away, max reach ${(maxReach * 1000).toFixed(0)}mm.`
  }

  return {
    pickupFeasible,
    depositFeasible,
    fullyFeasible: pickupFeasible && depositFeasible,
    pickupBlockedBy: approachCheck.blockingSurface,
    depositDistance,
    maxReach,
    errorMessage,
  }
}

// ── Deterministic fallback task builder ───────────────────────────────────────

/**
 * Build a complete safe task spec JSON.
 * Uses computed safe waypoints — guaranteed collision-free for the default scene.
 * Called when Gemini AI fails or produces an unsafe plan.
 */
export function buildFallbackTaskSpec(
  input: string,
  pickObjectId: string,
  destinationId: string,
  scene: SceneGraph,
  gripper: GripperConfig,
): any | null {
  const seq = computeSafePickSequence(pickObjectId, destinationId, scene)
  if (!seq) return null

  const pickObj = scene.objects.find(o => o.id === pickObjectId)
  const dest = getDestinationInfo(destinationId, scene)
  if (!pickObj || !dest) return null

  const force = Math.max(42, Math.min(95, gripper.force || 60))
  const label = `${pickObj.name} → ${dest.name}`

  // Check if the approach needs obstacle avoidance (e.g. shelf blocking the path)
  const avoidance = computeObstacleAwareApproach(pickObj, scene)

  // Build approach steps — insert obstacle-avoidance intermediate waypoint if needed
  const approachSteps: any[] = []
  let stepId = 1

  if (avoidance.needsAvoidance) {
    // Intermediate: hover at same X but safe Z (outside blocking surface footprint)
    approachSteps.push({
      stepId: stepId++, type: 'move', targetName: pickObjectId,
      x: seq.approachHover[0], y: seq.approachHover[1], z: avoidance.safeApproachZ,
      speed: 0.4, approach: 'linear',
    })
  }

  // Standard approach hover above pickup
  approachSteps.push({
    stepId: stepId++, type: 'move', targetName: pickObjectId,
    x: seq.approachHover[0], y: seq.approachHover[1], z: seq.approachHover[2],
    speed: 0.5, approach: 'above',
  })

  // Descend to grip
  approachSteps.push({
    stepId: stepId++, type: 'move', targetName: pickObjectId,
    x: seq.gripPoint[0], y: seq.gripPoint[1], z: seq.gripPoint[2],
    speed: 0.25, approach: 'linear',
  })

  const warnings = ['Deterministic planner — waypoints computed from scene AABB geometry.']
  if (avoidance.needsAvoidance) {
    warnings.push(`Obstacle-aware approach: routes around ${avoidance.blockingSurface} via Z=${avoidance.safeApproachZ.toFixed(3)}m.`)
  }

  return {
    taskName: `Pick & Place: ${label}`,
    taskDescription: `Deterministic collision-free pick-and-place. Input: "${input.slice(0, 80)}"`,
    confidenceScore: 0.72,
    warnings,
    steps: [
      ...approachSteps,
      // Grip close (stepId continues from approachSteps)
      { stepId: stepId++, type: 'grip', action: 'close', force },
      // Lift straight up to transit height
      {
        stepId: stepId++, type: 'move', targetName: pickObjectId,
        x: seq.liftPoint[0], y: seq.liftPoint[1], z: seq.liftPoint[2],
        speed: 0.35, approach: 'linear',
      },
      // Transit laterally at safe height above destination
      {
        stepId: stepId++, type: 'move', targetName: destinationId,
        x: seq.destHover[0], y: seq.destHover[1], z: seq.destHover[2],
        speed: 0.5, approach: 'linear',
      },
      // Lower to deposit height
      {
        stepId: stepId++, type: 'move', targetName: destinationId,
        x: seq.depositPoint[0], y: seq.depositPoint[1], z: seq.depositPoint[2],
        speed: 0.22, approach: 'linear',
      },
      // Release
      { stepId: stepId++, type: 'grip', action: 'open', force: 0 },
      // Retreat to transit height
      {
        stepId: stepId++, type: 'move', targetName: destinationId,
        x: seq.retreatPoint[0], y: seq.retreatPoint[1], z: seq.retreatPoint[2],
        speed: 0.4, approach: 'linear',
      },
    ],
  }
}

// ── Gemini output coordinate normalizer ───────────────────────────────────────

/**
 * Post-processes a Gemini-generated task spec to replace move step coordinates
 * with scene-planner-computed collision-free values.
 *
 * This is called AFTER Gemini runs — Gemini's taskName, taskDescription,
 * confidenceScore, warnings, and step structure are preserved.
 * Only the x/y/z coordinates of move steps are replaced with safe values
 * derived from the actual scene AABB geometry.
 *
 * Architecture: Gemini handles intent + reasoning. Scene planner handles safety.
 */
export function normalizeTaskCoordinates(task: any, scene: SceneGraph): any {
  const steps: any[] = Array.isArray(task?.steps) ? task.steps : []
  if (steps.length === 0) return task

  // Find grip-close index (identifies the pickup point)
  const closeIdx = steps.findIndex(
    (s: any) => s.type === 'grip' &&
      String(s.action ?? s.gripAction ?? '').toLowerCase() === 'close',
  )
  if (closeIdx < 0) return task // no pickup step — keep task as-is

  // Find grip-open index after close
  const openIdx = steps.findIndex(
    (s: any, i: number) =>
      i > closeIdx &&
      s.type === 'grip' &&
      String(s.action ?? s.gripAction ?? '').toLowerCase() === 'open',
  )

  // Identify pickup object from last pre-close move's targetName
  const preCloseMoves = steps.slice(0, closeIdx).filter((s: any) => s.type === 'move')
  const lastPreCloseMove = preCloseMoves[preCloseMoves.length - 1]
  const pickRaw: string =
    lastPreCloseMove?.targetName ??
    lastPreCloseMove?.targetId ??
    lastPreCloseMove?.target_name ??
    ''

  // Resolve pickup object in scene (fuzzy match)
  const resolvedPick = _resolveObjectInScene(pickRaw, scene)
  if (!resolvedPick || resolvedPick.type === 'surface' || resolvedPick.type === 'zone') {
    return task
  }

  // Identify destination from the first post-close move that targets something
  // OTHER than the pickup object. The first post-close move is always the LIFT
  // (it still targets the pickup object). Gemini sometimes puts wrong X/Z on
  // destination steps — the normalizer corrects all coordinates from scene geometry.
  const allPostCloseMoves = steps.slice(closeIdx + 1).filter((s: any) => s.type === 'move')
  const destMove = allPostCloseMoves.find((s: any) => {
    const raw = String(s.targetName ?? s.targetId ?? s.target_name ?? '').trim()
    if (!raw) return false
    const resolvedId =
      _resolveZoneInScene(raw, scene)?.id ??
      _resolveObjectInScene(raw, scene)?.id
    return resolvedId && resolvedId !== resolvedPick.id
  })
  const destRaw: string =
    destMove?.targetName ?? destMove?.targetId ?? destMove?.target_name ?? ''
  const destId =
    _resolveZoneInScene(destRaw, scene)?.id ??
    _resolveObjectInScene(destRaw, scene)?.id ??
    scene.targetZones[0]?.id
  if (!destId) return task

  // Compute proven-safe waypoints
  const seq = computeSafePickSequence(resolvedPick.id, destId, scene)
  if (!seq) return task

  // Count pre-open post-close moves so we can correctly assign the LAST one
  // as depositPoint (not destHover). Structure for standard pick-and-place:
  //   pre-close:            [approach*, grip_descend]
  //   post-close, pre-open: [lift, transit*, deposit]    ← last = deposit
  //   post-open:            [retreat*]
  const preOpenPostCloseMoves = steps.slice(closeIdx + 1, openIdx >= 0 ? openIdx : undefined)
    .filter((s: any) => s.type === 'move')
  const totalPreOpen = preOpenPostCloseMoves.length

  let preCloseCount  = 0
  let postCloseCount = 0

  const safeSteps = steps.map((step: any, i: number) => {
    if (step.type !== 'move') return step

    // ── Pre-close moves ──────────────────────────────────────────────────────
    if (i < closeIdx) {
      preCloseCount++
      const isLast = preCloseCount === preCloseMoves.length
      return isLast
        ? { ...step, x: seq.gripPoint[0],     y: seq.gripPoint[1],     z: seq.gripPoint[2] }
        : { ...step, x: seq.approachHover[0], y: seq.approachHover[1], z: seq.approachHover[2] }
    }

    // ── Post-close, pre-open moves ───────────────────────────────────────────
    if (i > closeIdx && (openIdx < 0 || i < openIdx)) {
      postCloseCount++
      if (postCloseCount === 1) {
        // First move after grip-close = lift straight up
        return { ...step, x: seq.liftPoint[0], y: seq.liftPoint[1], z: seq.liftPoint[2] }
      }
      if (postCloseCount === totalPreOpen) {
        // Last move before grip-open = lower to deposit height
        return { ...step, x: seq.depositPoint[0], y: seq.depositPoint[1], z: seq.depositPoint[2] }
      }
      // Middle moves = lateral transit at safe height above destination
      return { ...step, x: seq.destHover[0], y: seq.destHover[1], z: seq.destHover[2] }
    }

    // ── Post-open moves = retreat away from deposit ──────────────────────────
    if (openIdx >= 0 && i > openIdx) {
      return { ...step, x: seq.retreatPoint[0], y: seq.retreatPoint[1], z: seq.retreatPoint[2] }
    }

    return step
  })

  return {
    ...task,
    steps: safeSteps,
    warnings: [
      ...(Array.isArray(task.warnings) ? task.warnings : []),
      `Coordinates safety-normalized by scene planner (transit height: ${seq.transitHeight.toFixed(3)}m).`,
    ],
  }
}

// ── Private scene resolution helpers ─────────────────────────────────────────

function _resolveObjectInScene(raw: string, scene: SceneGraph): SceneObject | null {
  if (!raw) return null
  const key = raw.toLowerCase()
  return (
    scene.objects.find(o => o.id.toLowerCase() === key) ??
    scene.objects.find(o => o.name.toLowerCase() === key) ??
    scene.objects.find(o => key.includes(o.id.toLowerCase()) || o.id.toLowerCase().includes(key)) ??
    null
  )
}

function _resolveZoneInScene(raw: string, scene: SceneGraph): TargetZone | null {
  if (!raw) return null
  const key = raw.toLowerCase()
  return (
    scene.targetZones.find(z => z.id.toLowerCase() === key) ??
    scene.targetZones.find(z => z.name.toLowerCase() === key) ??
    scene.targetZones.find(z => key.includes(z.id.toLowerCase()) || z.id.toLowerCase().includes(key)) ??
    null
  )
}
