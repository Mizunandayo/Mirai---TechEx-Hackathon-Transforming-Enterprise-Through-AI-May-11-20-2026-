import { useSetAtom } from 'jotai'
import { pendingAddNodeAtom } from '../../store/taskAtoms'




interface PaletteItemDef {
  type: string
  label: string
  description: string
  accent: string
}





const PALETTE_ITEMS: PaletteItemDef[] = [
  { type: 'move',  label: 'Move To',  description: 'Move arm to a target position',   accent: '#1d4ed8' },
  { type: 'grip',  label: 'Grip',     description: 'Open or close the gripper',        accent: '#15803d' },
  { type: 'wait',  label: 'Wait',     description: 'Pause for a set duration',          accent: '#b45309' },
  { type: 'loop',  label: 'Loop',     description: 'Repeat a sequence N times',         accent: '#6d28d9' },
  { type: 'if',    label: 'If',       description: 'Branch on a condition',             accent: '#b91c1c' },
  { type: 'end',   label: 'End',      description: 'Mark task completion',              accent: '#374151' },
]




export default function NodePalette() {
  const setPending = useSetAtom(pendingAddNodeAtom)

  function onDragStart(event: React.DragEvent, nodeType: string) {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }







  return (
    <div className="task-palette">
      <div className="task-palette-header">Blocks</div>
      <div className="task-palette-list">
        {PALETTE_ITEMS.map((item) => (
          <div
            key={item.type}
            className="palette-item"
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            onClick={() => setPending(item.type)}
            style={{ cursor: 'grab' }}
            title={`Drag onto canvas or click to add — ${item.description}`}
          >
            <span
              className="palette-item-accent"
              style={{ background: item.accent }}
            />
            <div className="palette-item-info">
              <span className="palette-item-label">{item.label}</span>
              <span className="palette-item-desc">{item.description}</span>
            </div>
            <svg className="palette-item-add-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        ))}
      </div>
      <p className="task-palette-hint">Drag onto canvas or click to add</p>
    </div>
  )
}