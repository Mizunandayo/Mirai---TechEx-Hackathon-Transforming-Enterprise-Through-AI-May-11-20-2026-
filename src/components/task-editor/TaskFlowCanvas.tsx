import { useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  type OnConnect,
} from '@xyflow/react'
import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import {
  taskNodesAtom,
  taskEdgesAtom,
  taskValidationAtom,
  pendingAddNodeAtom,
  selectedNodeIdAtom,
  ghostArmTargetAtom,
  INITIAL_START_NODE,
} from '../../store/taskAtoms'
import { armSegmentsAtom } from '../../store/atoms'
import { validateTask } from '../../utils/taskValidation'
import { exportTaskJson } from '../../utils/taskExport'
import { taskNameAtom, taskDescriptionAtom } from '../../store/taskAtoms'
import type { TaskBlock, MoveBlock } from '../../types/task'

import { StartNode } from './nodes/StartNode'
import { EndNode }   from './nodes/EndNode'
import { MoveNode }  from './nodes/MoveNode'
import { GripNode }  from './nodes/GripNode'
import { WaitNode }  from './nodes/WaitNode'
import { LoopNode }  from './nodes/LoopNode'
import { IfNode }    from './nodes/IfNode'
import { DeletableEdge } from './DeletableEdge'

// ─── Node types registry (stable reference — defined outside component) ────────

const NODE_TYPES = {
  start: StartNode,
  end:   EndNode,
  move:  MoveNode,
  grip:  GripNode,
  wait:  WaitNode,
  loop:  LoopNode,
  if:    IfNode,
} as const

const EDGE_TYPES = {
  default: DeletableEdge,
} as const
















function createNodeData(type: string): TaskBlock {
  const defaults: Record<string, TaskBlock> = {
    move: {
      kind: 'move', label: 'Move To',
      params: { targetId: null, x: 0.2, y: 0.3, z: 0, speed: 0.5, approach: 'above' },
    } as MoveBlock,
    grip: { kind: 'grip', label: 'Grip',  params: { action: 'close', force: 60 } },
    wait: { kind: 'wait', label: 'Wait',  params: { durationMs: 1000 } },
    loop: { kind: 'loop', label: 'Loop',  params: { count: 3 } },
    if:   { kind: 'if',   label: 'If',    params: { condition: '' } },
    end:  { kind: 'end',  label: 'End' },
  }
  return defaults[type] ?? { kind: 'end', label: type }
}

// Inner component — has ReactFlow context





function FlowEditor() {
  const initialNodes = useAtomValue(taskNodesAtom)
  const initialEdges = useAtomValue(taskEdgesAtom)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<TaskBlock>>(
    initialNodes.length > 0 ? initialNodes : [INITIAL_START_NODE],
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges)
  const { screenToFlowPosition } = useReactFlow()

  const setTaskNodes   = useSetAtom(taskNodesAtom)
  const setTaskEdges   = useSetAtom(taskEdgesAtom)
  const setValidation  = useSetAtom(taskValidationAtom)
  const setSelectedId  = useSetAtom(selectedNodeIdAtom)
  const setGhostTarget = useSetAtom(ghostArmTargetAtom)
  const armSegments    = useAtomValue(armSegmentsAtom)
  const taskName       = useAtomValue(taskNameAtom)
  const description    = useAtomValue(taskDescriptionAtom)

  const [pendingType, setPendingType] = useAtom(pendingAddNodeAtom)


  // Undo history — ref avoids atom complexity
  const historyRef = useRef<Array<{ nodes: Node<TaskBlock>[]; edges: Edge[] }>>([])
  const historyIdxRef = useRef(-1)



  // Sync to atoms + run validation on every change

  useEffect(() => {
    setTaskNodes(nodes)
    setTaskEdges(edges)
    const report = validateTask(nodes, edges, armSegments)
    setValidation(report)
  }, [nodes, edges, armSegments, setTaskNodes, setTaskEdges, setValidation])


  //  Push to undo history

  const pushHistory = useCallback((n: Node<TaskBlock>[], e: Edge[]) => {
    const truncated = historyRef.current.slice(0, historyIdxRef.current + 1)
    truncated.push({ nodes: n, edges: e })
    if (truncated.length > 20) truncated.shift()
    historyRef.current = truncated
    historyIdxRef.current = truncated.length - 1
  }, [])








  // Add node helper

  const addNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const id = `${type}-${Date.now()}`
      const newNode: Node<TaskBlock> = {
        id,
        type,
        position,
        data: createNodeData(type),
      }
      setNodes((prev) => {
        const next = [...prev, newNode]
        pushHistory(next, edges)
        return next
      })
    },
    [setNodes, edges, pushHistory],
  )







  // Handle palette click-to-add

  useEffect(() => {
    if (!pendingType) return
    const center = screenToFlowPosition({
      x: window.innerWidth  / 2,
      y: window.innerHeight / 2,
    })
    const offset = (nodes.length - 1) * 24
    addNode(pendingType, { x: center.x + offset - 110, y: center.y + offset })
    setPendingType(null)
  }, [pendingType, nodes.length, screenToFlowPosition, addNode, setPendingType])







  //  Handle drag-drop from palette

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      addNode(type, position)
    },
    [screenToFlowPosition, addNode],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])




  //  Connect edges 

  const onConnect = useCallback<OnConnect>(
    (connection: Connection) => {
      // Prevent self-connections
      if (connection.source === connection.target) return
      setEdges((eds) => {
        const next = addEdge({ ...connection, animated: false }, eds)
        pushHistory(nodes, next)
        return next
      })
    },
    [setEdges, nodes, pushHistory],
  )





  //  Undo (Ctrl+Z) 

  const handleUndo = useCallback(() => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current -= 1
    const prev = historyRef.current[historyIdxRef.current]
    if (prev) {
      setNodes(prev.nodes)
      setEdges(prev.edges)
    }
  }, [setNodes, setEdges])






  //  Export (Ctrl+S) 

  const handleExport = useCallback(() => {
    exportTaskJson(taskName, description, nodes, edges)
  }, [taskName, description, nodes, edges])







  // Load from file (event from TaskEditorPanel)

  useEffect(() => {
    function onLoadTask(e: Event) {
      const { detail } = e as CustomEvent
      if (!detail) return
      setNodes(detail.nodes ?? [INITIAL_START_NODE])
      setEdges(detail.edges ?? [])
      historyRef.current = []
      historyIdxRef.current = -1
    }
    window.addEventListener('mirai:load-task', onLoadTask)
    return () => window.removeEventListener('mirai:load-task', onLoadTask)
  }, [setNodes, setEdges])





  // Keyboard shortcuts 

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'

      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleExport()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !isInput) {
        e.preventDefault()
        handleUndo()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [handleExport, handleUndo])







  //  Node selection → ghost arm target 

  const onSelectionChange = useCallback(
    ({ nodes: selected }: { nodes: Node<TaskBlock>[] }) => {
      const first = selected[0]
      setSelectedId(first?.id ?? null)
      if (first?.data.kind === 'move') {
        const p = (first.data as MoveBlock).params
        setGhostTarget([p.x, p.y, p.z])
      } else {
        setGhostTarget(null)
      }
    },
    [setSelectedId, setGhostTarget],
  )

  //  Validation connection line — prevent invalid connections 

  const isValidConnection = useCallback((connection: Connection | Edge) => {
    if ('source' in connection && connection.source === connection.target) return false
    return true
  }, [])
















  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onSelectionChange={onSelectionChange}
      isValidConnection={isValidConnection}
      deleteKeyCode="Delete"
      fitView
      fitViewOptions={{ padding: 0.3 }}
      defaultEdgeOptions={{
        style: { stroke: '#0d0d0d', strokeWidth: 1.5 },
        animated: false,
      }}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        color="#c8c4be"
        gap={20}
        size={1.2}
        variant={BackgroundVariant.Dots}
      />
      <Controls
        showFitView
        showInteractive={false}
        className="task-flow-controls"
      />
    </ReactFlow>
  )
}






// Exported wrapper — provides ReactFlow context 

export default function TaskFlowCanvas() {
  return (
    <div className="task-canvas-wrapper">
      <ReactFlowProvider>
        <FlowEditor />
      </ReactFlowProvider>
    </div>
  )
}