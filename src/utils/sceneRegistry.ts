import type { SceneObject, TargetZone, SceneGraph } from '../types/task'

export const DEFAULT_SCENE_OBJECTS: SceneObject[] = [
  {
    id: 'table',
    name: 'Work Table',
    type: 'surface',
    position: [0, 0, 0],
    dimensions: [0.8, 0.02, 0.6],
    color: '#c8b89a',
  },
  {
    id: 'box-a',
    name: 'Box A',
    type: 'box',
    position: [0.2, 0.045, 0.1],
    dimensions: [0.08, 0.08, 0.08],
    color: '#6b8fa8',
  },
  {
    id: 'box-b',
    name: 'Box B',
    type: 'box',
    position: [-0.15, 0.035, 0.2],
    dimensions: [0.10, 0.06, 0.10],
    color: '#a8726b',
  },
  {
    id: 'cylinder-a',
    name: 'Cylinder A',
    type: 'cylinder',
    position: [0.3, 0.066, -0.1],
    dimensions: [0.04, 0.12, 0.04],
    color: '#7a8a6b',
  },
  {
    id: 'shelf',
    name: 'Shelf',
    type: 'surface',
    position: [0.5, 0.3, 0],
    dimensions: [0.4, 0.08, 0.2],   // height increased 0.02 → 0.08 (centre stays at Y=0.3)
    color: '#d4c5b0',
  },
  {
    id: 'drawer',
    name: 'Drawer Zone',
    type: 'zone',
    position: [-0.4, 0.15, 0],
    dimensions: [0.25, 0.2, 0.3],
    color: '#b0b8c8',
  },
]

export const DEFAULT_TARGET_ZONES: TargetZone[] = [
  { id: 'zone-shelf',        name: 'Shelf Drop Zone',  position: [0.5, 0.35, 0],  radius: 0.08 },
  { id: 'zone-drawer',       name: 'Drawer Zone',      position: [-0.4, 0.25, 0], radius: 0.1  },
  { id: 'zone-table-center', name: 'Table Center',     position: [0, 0.05, 0],    radius: 0.15 },
]

export const DEFAULT_SCENE_GRAPH: SceneGraph = {
  objects: DEFAULT_SCENE_OBJECTS,
  targetZones: DEFAULT_TARGET_ZONES,
}

export function getAllTargets(): Array<{ id: string; name: string; position: [number, number, number] }> {
  return [
    ...DEFAULT_SCENE_OBJECTS.map((o) => ({ id: o.id, name: o.name, position: o.position })),
    ...DEFAULT_TARGET_ZONES.map((z) => ({ id: z.id, name: z.name, position: z.position })),
  ]
}

export function getTargetById(id: string) {
  return (
    DEFAULT_SCENE_OBJECTS.find((o) => o.id === id) ??
    DEFAULT_TARGET_ZONES.find((z) => z.id === id) ??
    null
  )
}