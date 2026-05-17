import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { ArmSegment, GripperConfig } from '../types/arm';


// UI

/** Persited in Localstorage - survives page refresh**/
export const isAdvancedModeAtom = atomWithStorage<boolean>('mirai_advanced_mode', false)
export const activeDesignerTabAtom = atom<'segments' | 'gripper' | 'validate' | 'presets'>('segments')
export const showReachEnvelopeAtom = atomWithStorage<boolean>('mirai_show_reach_v2', false)
export const showJointArcsAtom = atomWithStorage<boolean>('mirai_show_arcs_v2', false)


const DEFAULT_ARM_NAME = 'Studio arm 01'

const DEFAULT_ARM_SEGMENTS: ArmSegment[] = [
  {
    id: 'seg-base',
    name: 'Base',
    length: 0.15,
    mass: 1.8,
    joint: 'fixed',
    jointLimitMin: 0,
    jointLimitMax: 0,
    material: 'aluminum',
    color: '#c7b8aa',
  },
  {
    id: 'seg-1',
    name: 'Segment 1',
    length: 0.35,
    mass: 0.9,
    joint: 'revolute',
    jointLimitMin: -90,
    jointLimitMax: 90,
    material: 'aluminum',
    color: '#d6dbe1',
  },
  {
    id: 'seg-2',
    name: 'Segment 2',
    length: 0.28,
    mass: 0.6,
    joint: 'revolute',
    jointLimitMin: -120,
    jointLimitMax: 120,
    material: 'aluminum',
    color: '#cbd3dc',
  },
]

const DEFAULT_ARM_GRIPPER: GripperConfig = {
  id: 'gripper-1',
  type: 'parallel_jaw',
  name: 'Parallel Jaw',
  width: 0.08,
  force: 50,
}


// Arm Config
export const armNameAtom = atomWithStorage<string>('mirai_arm_name_v1', DEFAULT_ARM_NAME)

export const armSegmentsAtom = atomWithStorage<ArmSegment[]>('mirai_arm_segments_v1', DEFAULT_ARM_SEGMENTS)

export const armGripperAtom = atomWithStorage<GripperConfig>('mirai_arm_gripper_v1', DEFAULT_ARM_GRIPPER)




/** ID of the currently selected segment - null when none selected **/
export const selectedSegmentIdAtom = atom<string | null>(null)

// Task Editor
export const taskBlocksAtom = atom<unknown[]>([])

export const taskMetaAtom = atom({
  name: 'Untitled Task',
  version: '0.0.1',
  description: '',
})


// Simulation
export const simulationFramesAtom = atom<unknown[]>([])
export const simulationPlayheadAtom = atom(0)
export const simulationStatusAtom = atom<'idle' | 'running' | 'paused' | 'completed' |'error'>('idle')


// Community
export const communityTasksAtom = atom<unknown[]>([])
export const selectedCommunityTaskAtom = atom<unknown | null>(null)


// Gemini
export const geminiLoadingAtom = atom(false)
export const geminiErrorAtom = atom<string | null>(null)
export const geminiResponseAtom = atom<string | null>(null)

export type ArmDesignTargets = {
  reachMeters: number
  payloadGrams: number
  jointCount: number
}

export const armDesignTargetsAtom = atomWithStorage<ArmDesignTargets | null>('mirai_arm_design_targets_v1', null)

export type ServoTier = 'mg995' | 'mg996r' | 'ds3218' | 'industrial'

export const armServoTierAtom = atomWithStorage<ServoTier>('mirai_arm_servo_tier_v1', 'mg996r')