import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { Node, Edge } from '@xyflow/react'
import type { TaskBlock, ValidationReport, SceneGraph } from '../types/task'
import { DEFAULT_SCENE_GRAPH } from '../utils/sceneRegistry'

// ─── Default start node (always present) ────────────────

export const INITIAL_START_NODE: Node<TaskBlock> = {
  id: 'start',
  type: 'start',
  position: { x: 220, y: 60 },
  data: { kind: 'start', label: 'Start' },
  deletable: false,
  selectable: true,
}

// ─── Flow State ─────────────────────

/** Synced from React Flow on every change — used by validation + export */
export const taskNodesAtom = atom<Node<TaskBlock>[]>([INITIAL_START_NODE])
export const taskEdgesAtom = atom<Edge[]>([])

// Task Meta 
export const taskNameAtom = atomWithStorage<string>('mirai_task_name', 'Untitled Task')
export const taskDescriptionAtom = atom<string>('')

// Scene
export const sceneGraphAtom = atom<SceneGraph>(DEFAULT_SCENE_GRAPH)

// Validation 
export const taskValidationAtom = atom<ValidationReport>({
  isValid: true,
  issues: [],
  issuesByNodeId: {},
})

// Ghost Arm Preview (consumed by ArmViewer on Day 4) 
/** When a MOVE node is selected + has valid coords, set this to show ghost in R3F */
export const ghostArmTargetAtom = atom<[number, number, number] | null>(null)


// Palette → Canvas communication 
/** Palette sets this; canvas reads, adds node, then resets to null */
export const pendingAddNodeAtom = atom<string | null>(null)

// Selected Node
export const selectedNodeIdAtom = atom<string | null>(null)