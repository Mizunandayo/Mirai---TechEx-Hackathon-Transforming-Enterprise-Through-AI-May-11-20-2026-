import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useRef, useState } from 'react'
import {
  armNameAtom,
  armSegmentsAtom,
  armGripperAtom,
  activeDesignerTabAtom,
  showReachEnvelopeAtom,
  showJointArcsAtom,
} from '../../store/atoms'
import { exportArmConfig, loadArmConfigFromFile } from '../../utils/armExport'
import SegmentList from './SegmentList'
import GripperLibrary from './GripperLibrary'
import ValidationPanel from './ValidationPanel'
import BOMCounter from './BOMCounter'
import NLArmDesigner from './NLArmDesigner'
import RobotPresetSelector from './RobotPresetSelector'

type Tab = 'segments' | 'gripper' | 'validate' | 'presets'

const TABS: { id: Tab; label: string }[] = [
  { id: 'segments', label: 'Arm' },
  { id: 'gripper',  label: 'Tool' },
  { id: 'validate', label: 'Review' },
  { id: 'presets',  label: 'Presets' },
]

const PANEL_MIN_WIDTH = 336
const PANEL_MAX_WIDTH = 560

type ArmDesignerPanelProps = {
  hidden?: boolean
}

export default function ArmDesignerPanel({
  hidden = false,
}: ArmDesignerPanelProps) {
  const [armName, setArmName] = useAtom(armNameAtom)
  const segments = useAtomValue(armSegmentsAtom)
  const gripper = useAtomValue(armGripperAtom)
  const [, setSegments] = useAtom(armSegmentsAtom)
  const [, setGripper] = useAtom(armGripperAtom)
  const [activeTab, setActiveTab] = useAtom(activeDesignerTabAtom)
  const [showReach, setShowReach] = useAtom(showReachEnvelopeAtom)
  const [showArcs, setShowArcs] = useAtom(showJointArcsAtom)
  const [panelWidth, setPanelWidth] = useState(PANEL_MIN_WIDTH)
  const dragStartXRef = useRef(0)
  const dragStartWidthRef = useRef(PANEL_MIN_WIDTH)

  const handleSave = useCallback(() => {
    exportArmConfig(armName, segments, gripper)
  }, [armName, segments, gripper])

  const handleLoad = useCallback(async () => {
    const config = await loadArmConfigFromFile()
    if (!config) return
    setArmName(config.name)
    setSegments(config.segments)
    setGripper(config.gripper)
  }, [setArmName, setSegments, setGripper])

  const handleResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (hidden) return

      dragStartXRef.current = event.clientX
      dragStartWidthRef.current = panelWidth

      const target = event.currentTarget
      target.setPointerCapture(event.pointerId)
      document.body.classList.add('panel-resizing')

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - dragStartXRef.current
        const next = Math.max(
          PANEL_MIN_WIDTH,
          Math.min(PANEL_MAX_WIDTH, dragStartWidthRef.current + delta),
        )
        setPanelWidth(next)
      }

      const handlePointerUp = () => {
        document.body.classList.remove('panel-resizing')
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointercancel', handlePointerUp)
      }

      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      window.addEventListener('pointercancel', handlePointerUp)
    },
    [hidden, panelWidth],
  )

  return (
    <aside
      className={`designer-panel${hidden ? ' panel--hidden' : ''}`}
      style={hidden ? undefined : { width: `${panelWidth}px` }}
    >
      <button
        type="button"
        className="panel-resize-handle"
        onPointerDown={handleResizePointerDown}
        aria-label="Resize panel"
        title="Drag to resize"
      />

      {/* Topbar: arm name + file actions */}
      <div className="panel-topbar">
        <input
          className="panel-arm-name"
          value={armName}
          onChange={(e) => setArmName(e.target.value)}
          placeholder="Unnamed arm"
          maxLength={40}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          data-gramm="false"
          data-gramm_editor="false"
          data-enable-grammarly="false"
          data-lt-active="false"
          aria-label="Arm name"
        />
        <div className="panel-topbar-actions">
          <button
            className="btn-topbar btn-topbar--ghost"
            onClick={handleLoad}
            title="Load arm config from file"
            style={{ cursor: 'pointer' }}
          >
            Open
          </button>
          <button
            className="btn-topbar btn-topbar--primary"
            onClick={handleSave}
            title="Save arm config as JSON"
            style={{ cursor: 'pointer' }}
          >
            Save
          </button>
        </div>
      </div>
{/* Natural language arm designer */}
      <NLArmDesigner />

      {/* Toolbar: tabs + viewport guide icons */}
      <div className="panel-toolbar">
        <div className="panel-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`panel-tab${activeTab === tab.id ? ' panel-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{ cursor: 'pointer' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="panel-guide-btns">
          <button
            className={`guide-btn${showReach ? ' guide-btn--on' : ''}`}
            onClick={() => setShowReach(!showReach)}
            title="Toggle reach envelope"
            style={{ cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="7" cy="7" r="1.8" fill="currentColor" />
            </svg>
          </button>
          <button
            className={`guide-btn${showArcs ? ' guide-btn--on' : ''}`}
            onClick={() => setShowArcs(!showArcs)}
            title="Toggle joint arcs"
            style={{ cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 11 Q7 2 12 11" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
              <circle cx="7" cy="6.5" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable tab content */}
      <div className="panel-content" role="tabpanel">
        {activeTab === 'segments' && <SegmentList />}
        {activeTab === 'gripper'  && <GripperLibrary />}
        {activeTab === 'validate' && <ValidationPanel />}
        {activeTab === 'presets'  && <RobotPresetSelector />}
      </div>

      {/* Footer: BOM */}
      <div className="panel-footer">
        <BOMCounter />
      </div>
    </aside>
  )
}