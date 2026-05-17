// src/data/communityTasks.ts
import type { GripperConfig } from '../types/arm'




export type TaskDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type TaskCategory   = 'manipulation' | 'assembly' | 'sorting' | 'inspection' | 'demo'
export type CommunityTask = {
  id:                   string
  name:                 string
  description:          string
  category:             TaskCategory
  difficulty:           TaskDifficulty
  featured:             boolean
  featuredLabel?:       string
  stepCount:            number
  estimatedSeconds:     number
  requiredReachM:       number
  requiredGripperType:  GripperConfig['type']
  tags:                 string[]
  taskSpec:             Record<string, unknown> 
}





// Proven waypoints from scene planner
const T = 0.53       // safe transit Y (clears shelf top at 0.34m + 0.19m margin)
const CYL_X = 0.3,  CYL_Y = 0.066,  CYL_Z = -0.1
const BOX_A_X = 0.2,  BOX_A_Y = 0.045, BOX_A_Z = 0.1
const BOX_B_X = -0.15, BOX_B_Y = 0.035, BOX_B_Z = 0.2
const SHELF_X = 0.5,  SHELF_Y = 0.35, SHELF_Z = 0
const DRAWER_X = -0.4, DRAWER_Y = 0.25, DRAWER_Z = 0
const TABLE_X = 0,  TABLE_Y = 0.05, TABLE_Z = 0

// ── Reusable step builders
function moveAbove(targetName: string, x: number, z: number, speed = 0.6) {
  return { type: 'move', targetName, x, y: T, z, speed }
}
function moveToGrip(targetName: string, x: number, y: number, z: number, speed = 0.45) {
  return { type: 'move', targetName, x, y, z, speed }
}
function grip(action: 'open' | 'close', force = 50) {
  return { type: 'grip', action, force }
}
function retreat(x: number, z: number, speed = 0.65) {
  return { type: 'move', targetName: '', x, y: T, z, speed }
}
function moveTo(targetName: string, x: number, y: number, z: number, speed = 0.55) {
  return { type: 'move', targetName, x, y, z, speed }
}

//  Pick-and-place sequences

// Cylinder A → Shelf (8 steps)
const PICK_CYL_TO_SHELF = [
  moveAbove('cylinder-a',  CYL_X, CYL_Z),
  moveToGrip('cylinder-a', CYL_X, CYL_Y, CYL_Z),
  grip('close', 50),
  moveAbove('cylinder-a',  CYL_X, CYL_Z, 0.5),
  moveAbove('zone-shelf',  SHELF_X, SHELF_Z),
  moveTo('zone-shelf',     SHELF_X, SHELF_Y, SHELF_Z),
  grip('open'),
  retreat(SHELF_X, SHELF_Z),
]

// Box A → Shelf (8 steps)
const PICK_BOX_A_TO_SHELF = [
  moveAbove('box-a',   BOX_A_X, BOX_A_Z),
  moveToGrip('box-a', BOX_A_X, BOX_A_Y, BOX_A_Z),
  grip('close', 65),
  moveAbove('box-a',   BOX_A_X, BOX_A_Z, 0.5),
  moveAbove('zone-shelf', SHELF_X, SHELF_Z),
  moveTo('zone-shelf',    SHELF_X, SHELF_Y, SHELF_Z),
  grip('open'),
  retreat(SHELF_X, SHELF_Z),
]

// Box B → Drawer (8 steps)
const PICK_BOX_B_TO_DRAWER = [
  moveAbove('box-b',   BOX_B_X, BOX_B_Z),
  moveToGrip('box-b', BOX_B_X, BOX_B_Y, BOX_B_Z),
  grip('close', 60),
  moveAbove('box-b',   BOX_B_X, BOX_B_Z, 0.5),
  moveAbove('zone-drawer', DRAWER_X, DRAWER_Z),
  moveTo('zone-drawer',    DRAWER_X, DRAWER_Y, DRAWER_Z),
  grip('open'),
  retreat(DRAWER_X, DRAWER_Z),
]

// Cylinder A → Drawer (8 steps)
const PICK_CYL_TO_DRAWER = [
  moveAbove('cylinder-a',  CYL_X, CYL_Z),
  moveToGrip('cylinder-a', CYL_X, CYL_Y, CYL_Z),
  grip('close', 40),
  moveAbove('cylinder-a',  CYL_X, CYL_Z, 0.5),
  moveAbove('zone-drawer', DRAWER_X, DRAWER_Z),
  moveTo('zone-drawer',    DRAWER_X, DRAWER_Y, DRAWER_Z),
  grip('open'),
  retreat(DRAWER_X, DRAWER_Z),
]

// Cylinder A → Table center (precision, 8 steps, slower speed)
const PICK_CYL_TO_CENTER = [
  moveAbove('cylinder-a',      CYL_X, CYL_Z, 0.4),
  moveToGrip('cylinder-a',     CYL_X, CYL_Y, CYL_Z, 0.3),
  grip('close', 35),
  moveAbove('cylinder-a',      CYL_X, CYL_Z, 0.35),
  moveAbove('zone-table-center', TABLE_X, TABLE_Z, 0.4),
  moveTo('zone-table-center',    TABLE_X, TABLE_Y + 0.08, TABLE_Z, 0.3),
  grip('open'),
  retreat(TABLE_X, TABLE_Z, 0.4),
]

// Box A → Drawer (mail sorting variant, 8 steps)
const PICK_BOX_A_TO_DRAWER = [
  moveAbove('box-a',   BOX_A_X, BOX_A_Z),
  moveToGrip('box-a', BOX_A_X, BOX_A_Y, BOX_A_Z),
  grip('close', 55),
  moveAbove('box-a',   BOX_A_X, BOX_A_Z, 0.5),
  moveAbove('zone-drawer', DRAWER_X, DRAWER_Z),
  moveTo('zone-drawer',    DRAWER_X, DRAWER_Y, DRAWER_Z),
  grip('open'),
  retreat(DRAWER_X, DRAWER_Z),
]

// Box A → Shelf THEN Box B → Shelf (assembly, 16 steps)
const BOX_STACK_ASSEMBLY = [
  ...PICK_BOX_A_TO_SHELF,
  // Pause between picks
  { type: 'wait', durationMs: 400 },
  // Pick Box B to same zone
  moveAbove('box-b',   BOX_B_X, BOX_B_Z),
  moveToGrip('box-b', BOX_B_X, BOX_B_Y, BOX_B_Z),
  grip('close', 60),
  moveAbove('box-b',   BOX_B_X, BOX_B_Z, 0.5),
  moveAbove('zone-shelf', SHELF_X, SHELF_Z),
  // Slightly higher deposit for stacking (box-a already there)
  moveTo('zone-shelf',    SHELF_X, SHELF_Y + 0.09, SHELF_Z),
  grip('open'),
  retreat(SHELF_X, SHELF_Z),
]

// Cylinder A → Drawer THEN Box A → Shelf (multi-sort, 17 steps)
const MULTI_OBJECT_SORT = [
  ...PICK_CYL_TO_DRAWER,
  { type: 'wait', durationMs: 350 },
  ...PICK_BOX_A_TO_SHELF,
]

// Inspection traverse: hover over objects then pick cylinder (12 steps)
const INSPECTION_TRAVERSE = [
  // Hover above box-a (inspect)
  moveAbove('box-a', BOX_A_X, BOX_A_Z, 0.3),
  { type: 'wait', durationMs: 500 },
  // Hover above box-b (inspect)
  moveAbove('box-b', BOX_B_X, BOX_B_Z, 0.3),
  { type: 'wait', durationMs: 500 },
  // Pick cylinder-a → shelf
  ...PICK_CYL_TO_SHELF,
]

// Slow/careful pick of box-b → shelf (fragile handling)
const FRAGILE_HANDLING = [
  moveAbove('box-b',   BOX_B_X, BOX_B_Z, 0.3),
  moveToGrip('box-b', BOX_B_X, BOX_B_Y, BOX_B_Z, 0.25),
  grip('close', 28),   // low force for fragile objects
  moveAbove('box-b',   BOX_B_X, BOX_B_Z, 0.28),
  moveAbove('zone-shelf', SHELF_X, SHELF_Z, 0.30),
  moveTo('zone-shelf',    SHELF_X, SHELF_Y, SHELF_Z, 0.25),
  grip('open'),
  retreat(SHELF_X, SHELF_Z, 0.3),
]




//Task spec wrapper

function spec(name: string, description: string, steps: object[]) {
  return {
    taskName:        name,
    taskDescription: description,
    confidenceScore: 0.95,
    steps:           steps.map((s, i) => ({ stepId: i + 1, ...s })),
  }
}












// The 12 seeded community tasks

export const COMMUNITY_TASKS: CommunityTask[] = [
  //FAMOUS PRELOADS (featured: true)
  {
    id:                  'boston-dynamics-inspection',
    name:                'Inspection Traverse',
    description:         'Survey each object in sequence, then secure cylinder-a to the shelf. Mimics industrial inspection routines used in autonomous factory deployments.',
    category:            'inspection',
    difficulty:          'intermediate',
    featured:            true,
    featuredLabel:       'Boston Dynamics-style',
    stepCount:           12,
    estimatedSeconds:    24,
    requiredReachM:      0.65,
    requiredGripperType: 'parallel_jaw',
    tags:                ['inspection', 'traverse', 'multi-step'],
    taskSpec:            spec('Inspection Traverse', 'Survey objects then secure cylinder-a', INSPECTION_TRAVERSE),
  },
  {
    id:                  'tesla-optimus-stack',
    name:                'Box Stack Assembly',
    description:         'Pick Box A to shelf, then stack Box B on top. Demonstrates the sequential multi-object handling used in Tesla Optimus warehouse operations.',
    category:            'assembly',
    difficulty:          'intermediate',
    featured:            true,
    featuredLabel:       'Tesla Optimus-style',
    stepCount:           17,
    estimatedSeconds:    32,
    requiredReachM:      0.70,
    requiredGripperType: 'parallel_jaw',
    tags:                ['stacking', 'assembly', 'multi-object'],
    taskSpec:            spec('Box Stack Assembly', 'Sequential pick-and-stack of Box A and Box B', BOX_STACK_ASSEMBLY),
  },
  {
    id:                  'toyota-laundry-fold',
    name:                'Laundry Fold Demo',
    description:         'Slow, controlled transfer of cylinder-a to the shelf at reduced speed and force — representing the delicate manipulation profile of Toyota Research Institute\'s laundry-folding robot.',
    category:            'demo',
    difficulty:          'advanced',
    featured:            true,
    featuredLabel:       'Toyota Research-style',
    stepCount:           8,
    estimatedSeconds:    28,
    requiredReachM:      0.60,
    requiredGripperType: 'suction_cup',
    tags:                ['slow', 'delicate', 'curated-demo'],
    taskSpec:            spec('Laundry Fold Demo', 'Slow controlled pick of cylinder-a representing textile handling', PICK_CYL_TO_SHELF),
  },

  // STANDARD LIBRARY 
  {
    id:                  'pick-place-cylinder-shelf',
    name:                'Pick and Place — Cylinder A',
    description:         'Fundamental pick-and-place: retrieve Cylinder A from the work table and deposit it on the shelf. The canonical introductory task.',
    category:            'manipulation',
    difficulty:          'beginner',
    featured:            false,
    stepCount:           8,
    estimatedSeconds:    15,
    requiredReachM:      0.60,
    requiredGripperType: 'parallel_jaw',
    tags:                ['pick', 'place', 'tutorial'],
    taskSpec:            spec('Pick and Place — Cylinder A', 'Retrieve Cylinder A and deposit on shelf', PICK_CYL_TO_SHELF),
  },
  {
    id:                  'restock-box-a',
    name:                'Shelf Restocking — Box A',
    description:         'Retrieve Box A from the table surface and place it on the shelf. Common in warehouse picking and logistics automation.',
    category:            'manipulation',
    difficulty:          'beginner',
    featured:            false,
    stepCount:           8,
    estimatedSeconds:    15,
    requiredReachM:      0.55,
    requiredGripperType: 'parallel_jaw',
    tags:                ['restocking', 'shelf', 'logistics'],
    taskSpec:            spec('Shelf Restocking — Box A', 'Pick Box A and place on shelf', PICK_BOX_A_TO_SHELF),
  },
  {
    id:                  'sort-box-b-drawer',
    name:                'Drawer Sorting — Box B',
    description:         'Classify Box B as a target for the drawer zone. Foundational task for mail sorting, e-commerce fulfillment, and pharmaceutical dispensing.',
    category:            'sorting',
    difficulty:          'beginner',
    featured:            false,
    stepCount:           8,
    estimatedSeconds:    15,
    requiredReachM:      0.50,
    requiredGripperType: 'parallel_jaw',
    tags:                ['sorting', 'drawer', 'classification'],
    taskSpec:            spec('Drawer Sorting — Box B', 'Pick Box B and sort to drawer zone', PICK_BOX_B_TO_DRAWER),
  },
  {
    id:                  'multi-sort',
    name:                'Multi-Object Sort',
    description:         'Sort two objects simultaneously: Cylinder A to drawer, then Box A to shelf. Tests the arm\'s ability to execute sequential multi-target plans.',
    category:            'sorting',
    difficulty:          'intermediate',
    featured:            false,
    stepCount:           17,
    estimatedSeconds:    30,
    requiredReachM:      0.70,
    requiredGripperType: 'parallel_jaw',
    tags:                ['multi-object', 'sorting', 'sequential'],
    taskSpec:            spec('Multi-Object Sort', 'Sort Cylinder A to drawer, Box A to shelf', MULTI_OBJECT_SORT),
  },
  {
    id:                  'precision-placement',
    name:                'Precision Placement — Center',
    description:         'Controlled slow-speed placement of Cylinder A to the exact center of the workspace. Tests fine positioning and low-force grip control.',
    category:            'manipulation',
    difficulty:          'intermediate',
    featured:            false,
    stepCount:           8,
    estimatedSeconds:    22,
    requiredReachM:      0.45,
    requiredGripperType: 'parallel_jaw',
    tags:                ['precision', 'slow', 'center'],
    taskSpec:            spec('Precision Placement', 'Slow controlled placement of Cylinder A to table center', PICK_CYL_TO_CENTER),
  },
  {
    id:                  'fragile-handling',
    name:                'Fragile Object Handling',
    description:         'Transport Box B with 28N grip force and 25% reduced speed. Demonstrates force-limited manipulation for glass, sensors, or consumer electronics.',
    category:            'manipulation',
    difficulty:          'intermediate',
    featured:            false,
    stepCount:           8,
    estimatedSeconds:    25,
    requiredReachM:      0.60,
    requiredGripperType: 'parallel_jaw',
    tags:                ['fragile', 'low-force', 'careful'],
    taskSpec:            spec('Fragile Object Handling', 'Slow low-force transport of Box B to shelf', FRAGILE_HANDLING),
  },
  {
    id:                  'mail-sorting',
    name:                'Mail Sorting — Left Bin',
    description:         'Route Box A to the drawer (left bin). Simulates a postal sorting station where packages are classified by weight/dimension and directed to destination bins.',
    category:            'sorting',
    difficulty:          'beginner',
    featured:            false,
    stepCount:           8,
    estimatedSeconds:    15,
    requiredReachM:      0.55,
    requiredGripperType: 'parallel_jaw',
    tags:                ['mail', 'sorting', 'bin'],
    taskSpec:            spec('Mail Sorting — Left Bin', 'Route Box A to drawer (left bin)', PICK_BOX_A_TO_DRAWER),
  },
  {
    id:                  'lab-sample-transfer',
    name:                'Laboratory Sample Transfer',
    description:         'Precision transfer of Cylinder A (sample vial) to the secure drawer zone. Low speed, light grip. Common in lab automation and pharmaceutical handling.',
    category:            'manipulation',
    difficulty:          'intermediate',
    featured:            false,
    stepCount:           8,
    estimatedSeconds:    20,
    requiredReachM:      0.55,
    requiredGripperType: 'suction_cup',
    tags:                ['lab', 'sample', 'precision'],
    taskSpec:            spec('Laboratory Sample Transfer', 'Transfer Cylinder A to drawer as a sample vial', PICK_CYL_TO_DRAWER),
  },
]

export const FEATURED_TASKS   = COMMUNITY_TASKS.filter(t => t.featured)
export const STANDARD_TASKS   = COMMUNITY_TASKS.filter(t => !t.featured)
export const CATEGORIES: TaskCategory[] = ['manipulation', 'assembly', 'sorting', 'inspection', 'demo']
