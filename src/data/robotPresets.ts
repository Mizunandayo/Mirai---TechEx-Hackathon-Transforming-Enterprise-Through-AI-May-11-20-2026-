// src/data/robotPresets.ts
import type { ArmSegment, GripperConfig } from '../types/arm'






export type RobotPreset = {
  id:          string
  name:        string
  brand:       string
  description: string
  reach:       number   // meters
  payload:     number   // kg
  dof:         number
  accentColor: string   // brand color for visual accent strip
  segments:    ArmSegment[]
  gripper:     GripperConfig
}





export const ROBOT_PRESETS: RobotPreset[] = [
  {
    id:          'custom',
    name:        'Custom Arm',
    brand:       'Mirai Studio',
    description: 'Your current arm configuration. Fully editable.',
    reach:       0,   // dynamic — derived from current segments
    payload:     0,
    dof:         0,
    accentColor: '#0d0d0d',
    segments:    [],  // sentinel — means "use current atoms"
    gripper:     {
      id: 'gripper-1', type: 'parallel_jaw',
      name: 'Parallel Jaw', width: 0.08, force: 50,
    },
  },
  {
    id:          'ur5',
    name:        'UR5',
    brand:       'Universal Robots',
    description: '6-DOF collaborative arm. 850mm reach, 5kg payload. Industry standard for light assembly and pick-and-place.',
    reach:       0.85,
    payload:     5,
    dof:         6,
    accentColor: '#1f6fb2',   // UR blue
    segments: [
      {
        id:            'seg-base',
        name:          'Base',
        length:        0.162,
        mass:          4.0,
        joint:         'fixed',
        jointLimitMin: 0,
        jointLimitMax: 0,
        material:      'aluminum',
        color:         '#b8b8bc',
      },
      {
        id:            'seg-shoulder',
        name:          'Shoulder',
        length:        0.425,
        mass:          3.7,
        joint:         'revolute',
        jointLimitMin: -180,
        jointLimitMax: 180,
        material:      'aluminum',
        color:         '#cccccc',
      },
      {
        id:            'seg-elbow',
        name:          'Elbow',
        length:        0.392,
        mass:          1.8,
        joint:         'revolute',
        jointLimitMin: -180,
        jointLimitMax: 180,
        material:      'aluminum',
        color:         '#c8c8cc',
      },
      {
        id:            'seg-wrist',
        name:          'Wrist',
        length:        0.11,
        mass:          0.6,
        joint:         'revolute',
        jointLimitMin: -360,
        jointLimitMax: 360,
        material:      'aluminum',
        color:         '#b8b8bc',
      },
    ],
    gripper: {
      id: 'gripper-1', type: 'parallel_jaw',
      name: 'UR Robotiq 2F-85', width: 0.085, force: 80,
    },
  },
  {
    id:          'kuka-kr6',
    name:        'KR 6 R700',
    brand:       'KUKA',
    description: '6-DOF compact industrial arm. 706mm reach, 6kg payload. Precision-rated for harsh factory environments.',
    reach:       0.706,
    payload:     6,
    dof:         6,
    accentColor: '#F8B700',   // KUKA yellow-orange
    segments: [
      {
        id:            'seg-base',
        name:          'Base',
        length:        0.20,
        mass:          6.0,
        joint:         'fixed',
        jointLimitMin: 0,
        jointLimitMax: 0,
        material:      'steel',
        color:         '#d4a800',
      },
      {
        id:            'seg-link1',
        name:          'Link 1',
        length:        0.35,
        mass:          3.5,
        joint:         'revolute',
        jointLimitMin: -170,
        jointLimitMax: 170,
        material:      'steel',
        color:         '#e8b800',
      },
      {
        id:            'seg-link2',
        name:          'Link 2',
        length:        0.28,
        mass:          2.0,
        joint:         'revolute',
        jointLimitMin: -120,
        jointLimitMax: 155,
        material:      'steel',
        color:         '#e0b000',
      },
      {
        id:            'seg-wrist',
        name:          'Wrist',
        length:        0.09,
        mass:          0.8,
        joint:         'revolute',
        jointLimitMin: -350,
        jointLimitMax: 350,
        material:      'steel',
        color:         '#d4a800',
      },
    ],
    gripper: {
      id: 'gripper-1', type: 'parallel_jaw',
      name: 'KUKA Parallel Jaw', width: 0.12, force: 100,
    },
  },
  {
    id:          'abb-irb1200',
    name:        'IRB 1200',
    brand:       'ABB',
    description: '6-DOF compact arm. 700mm reach, 5kg payload. ABB\'s most compact industrial robot for electronics assembly.',
    reach:       0.70,
    payload:     5,
    dof:         6,
    accentColor: '#F7941D',   // ABB orange
    segments: [
      {
        id:            'seg-base',
        name:          'Base',
        length:        0.185,
        mass:          5.5,
        joint:         'fixed',
        jointLimitMin: 0,
        jointLimitMax: 0,
        material:      'aluminum',
        color:         '#e07000',
      },
      {
        id:            'seg-upper',
        name:          'Upper Arm',
        length:        0.360,
        mass:          3.2,
        joint:         'revolute',
        jointLimitMin: -165,
        jointLimitMax: 165,
        material:      'aluminum',
        color:         '#f08030',
      },
      {
        id:            'seg-forearm',
        name:          'Forearm',
        length:        0.270,
        mass:          1.5,
        joint:         'revolute',
        jointLimitMin: -110,
        jointLimitMax: 110,
        material:      'aluminum',
        color:         '#e87828',
      },
      {
        id:            'seg-wrist',
        name:          'Wrist',
        length:        0.08,
        mass:          0.5,
        joint:         'revolute',
        jointLimitMin: -300,
        jointLimitMax: 300,
        material:      'aluminum',
        color:         '#e07000',
      },
    ],
    gripper: {
      id: 'gripper-1', type: 'parallel_jaw',
      name: 'ABB Compact Jaw', width: 0.08, force: 60,
    },
  },
]

export const CUSTOM_PRESET   = ROBOT_PRESETS[0]
export const REAL_PRESETS    = ROBOT_PRESETS.slice(1)
