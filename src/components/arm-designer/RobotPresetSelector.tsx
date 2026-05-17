// src/components/arm-designer/RobotPresetSelector.tsx
import { useCallback } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { armSegmentsAtom, armGripperAtom, armNameAtom } from '../../store/atoms'
import { activeRobotPresetIdAtom } from '../../store/communityAtoms'
import { ROBOT_PRESETS } from '../../data/robotPresets'












export default function RobotPresetSelector() {
  const [activePresetId, setActivePresetId] = useAtom(activeRobotPresetIdAtom)
  const setSegments = useSetAtom(armSegmentsAtom)
  const setGripper  = useSetAtom(armGripperAtom)
  const setArmName  = useSetAtom(armNameAtom)

  const handleSelect = useCallback((presetId: string) => {
    const preset = ROBOT_PRESETS.find(p => p.id === presetId)
    if (!preset) return

    setActivePresetId(presetId)

    if (presetId === 'custom') {
      // Restore is a no-op — custom uses current atoms
      return
    }

    setSegments(preset.segments)
    setGripper(preset.gripper)
    setArmName(`${preset.brand} ${preset.name}`)
  }, [setActivePresetId, setSegments, setGripper, setArmName])











  
  return (
    <div className="rps-root">
      <div className="rps-header">
        <span className="rps-header-label">Robot Presets</span>
        <span className="rps-header-hint">Select to load real robot specs</span>
      </div>

      <div className="rps-grid">
        {ROBOT_PRESETS.map(preset => {
          const isActive  = activePresetId === preset.id
          const isCustom  = preset.id === 'custom'

          return (
            <button
              key={preset.id}
              type="button"
              className={`rps-card${isActive ? ' rps-card--active' : ''}`}
              onClick={() => handleSelect(preset.id)}
              style={{ cursor: 'pointer' }}
              aria-pressed={isActive}
              aria-label={`${isActive ? 'Selected: ' : ''}${preset.name} by ${preset.brand}`}
            >
              {/* Brand accent strip */}
              <div
                className="rps-card-accent"
                style={{ background: preset.accentColor }}
              />

              {/* Selection check */}
              {isActive && (
                <div className="rps-card-check" aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="m3 8 3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              {/* Card body */}
              <div className="rps-card-body">
                <div className="rps-card-name">{preset.name}</div>
                <div className="rps-card-brand">{preset.brand}</div>
              </div>

              {/* Specs row */}
              {!isCustom && (
                <div className="rps-card-specs">
                  <span className="rps-spec">
                    <span className="rps-spec-val">{(preset.reach * 1000).toFixed(0)}</span>
                    <span className="rps-spec-unit">mm</span>
                  </span>
                  <span className="rps-spec-divider"/>
                  <span className="rps-spec">
                    <span className="rps-spec-val">{preset.payload}</span>
                    <span className="rps-spec-unit">kg</span>
                  </span>
                  <span className="rps-spec-divider"/>
                  <span className="rps-spec">
                    <span className="rps-spec-val">{preset.dof}</span>
                    <span className="rps-spec-unit">DOF</span>
                  </span>
                </div>
              )}

              {isCustom && (
                <div className="rps-card-specs">
                  <span className="rps-spec">
                    <span className="rps-spec-val">Custom</span>
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Description of active preset */}
      {(() => {
        const active = ROBOT_PRESETS.find(p => p.id === activePresetId)
        if (!active) return null
        return (
          <div className="rps-description" key={activePresetId}>
            {active.description}
          </div>
        )
      })()}
    </div>
  )
}
