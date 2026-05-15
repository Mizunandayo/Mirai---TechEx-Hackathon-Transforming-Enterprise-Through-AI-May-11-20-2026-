// src/utils/armContextBuilder.ts

import { ArmSegment, GripperConfig } from '../types/arm';
import { AIPlanRequest } from '../types/ai';
import type { SceneGraph } from '../types/task';

const GRIPPER_TYPE_MAP: Record<GripperConfig['type'], AIPlanRequest['armContext']['gripper']['type']> = {
  parallel_jaw: 'parallel',
  suction_cup: 'suction',
  magnetic: 'magnetic',
};




export function buildArmContext(
  segments: ArmSegment[],
  gripper: GripperConfig,
  _scene: unknown
): AIPlanRequest['armContext'] {
  /**
   * Convert arm state to Gemini-friendly format.
   */
  
  const totalLength = segments.reduce((sum, seg) => sum + seg.length, 0);
  const maxReach = totalLength * 1.1; // 10% margin
  
  return {
    segments: segments.map((seg) => ({
      name: seg.name,
      length: seg.length,
      mass: seg.mass,
    })),
    gripper: {
      type: GRIPPER_TYPE_MAP[gripper.type],
    },
    maxReach,
    payloadLimit: 2.0,
  };
}







export function getSceneObjectNames(scene: unknown): string[] {
  /**
   * Extract list of named objects in scene.
   * Used as context for Gemini (e.g., "red_box", "shelf", "work_table").
   */
  const sg = scene as SceneGraph | null
  if (sg && Array.isArray(sg.objects)) {
    const objectLines = sg.objects.map((obj) => {
      const [x, y, z] = obj.position
      const [w, h, d] = obj.dimensions
      return `${obj.name} (${obj.id}) type=${obj.type} pos=(${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}) size=(${w.toFixed(3)},${h.toFixed(3)},${d.toFixed(3)})`
    })

    const zoneLines = Array.isArray(sg.targetZones)
      ? sg.targetZones.map((zone) => {
          const [x, y, z] = zone.position
          return `${zone.name} (${zone.id}) zone pos=(${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}) radius=${zone.radius.toFixed(3)}`
        })
      : []

    return [...objectLines, ...zoneLines]
  }

  return ['Work Table', 'Box A', 'Box B', 'Cylinder A', 'Shelf', 'Drawer Zone'];
}

export function buildAllowedVerbs(): string[] {
  /**
   * Day 5 scope: rigid object manipulation only.
   */
  return ['pick', 'place', 'stack', 'move', 'sort'];
}