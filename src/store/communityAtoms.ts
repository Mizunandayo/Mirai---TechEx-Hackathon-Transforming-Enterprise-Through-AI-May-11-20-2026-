// src/store/communityAtoms.ts
import { atom } from 'jotai'
import type { TaskCategory } from '../data/communityTasks'

// Active filter tab on the Library page
export const libraryFilterAtom = atom<TaskCategory | 'all' | 'featured'>('featured')

// Track which task is currently being imported (loading state)
export const importingTaskIdAtom = atom<string | null>(null)

// Active robot preset ID ('custom' | 'ur5' | 'kuka-kr6' | 'abb-irb1200')
export const activeRobotPresetIdAtom = atom<string>('custom')
