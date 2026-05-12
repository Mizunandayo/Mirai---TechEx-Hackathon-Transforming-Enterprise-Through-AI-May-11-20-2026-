import type { Node, Edge } from '@xyflow/react'
import type { TaskBlock, TaskSpec } from '../types/task'

// ─── Export ───────────────────────────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-_]/g, '')   // strip special chars
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .slice(0, 64)                       // max 64 chars
    || 'task'
}

export function exportTaskJson(
  name: string,
  description: string,
  nodes: Node<TaskBlock>[],
  edges: Edge[],
): void {
  const spec: TaskSpec = {
    id: `task-${Date.now()}`,
    name: name.trim() || 'Untitled Task',
    version: '1.0',
    createdAt: new Date().toISOString(),
    description: description.trim(),
    sceneId: 'default',
    blocks: nodes.map((n) => n.data),
  }

  // Store full flow graph (nodes with positions) so it can be re-imported
  const payload = {
    spec,
    flow: { nodes, edges },
    exportedBy: 'Mirai v0.1.0',
  }

  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${sanitizeFilename(spec.name)}.mirai-task.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

// ─ Import / Parse 

type ImportResult = {
  nodes: Node<TaskBlock>[]
  edges: Edge[]
  name: string
  description: string
}



/** Validates imported JSON structure without trusting raw content */
function isImportable(raw: unknown): raw is { spec: TaskSpec; flow: { nodes: Node<TaskBlock>[]; edges: Edge[] } } {
  if (typeof raw !== 'object' || raw === null) return false
  const r = raw as Record<string, unknown>
  if (typeof r['spec'] !== 'object' || r['spec'] === null) return false
  const spec = r['spec'] as Record<string, unknown>
  if (spec['version'] !== '1.0') return false
  if (!Array.isArray(spec['blocks'])) return false
  if (typeof r['flow'] !== 'object' || r['flow'] === null) return false
  const flow = r['flow'] as Record<string, unknown>
  if (!Array.isArray(flow['nodes']) || !Array.isArray(flow['edges'])) return false
  return true
}

export function parseTaskJson(json: string): ImportResult | null {
  try {
    const raw: unknown = JSON.parse(json)
    if (!isImportable(raw)) return null
    return {
      nodes: raw.flow.nodes,
      edges: raw.flow.edges,
      name: String(raw.spec.name ?? 'Imported Task').slice(0, 80),
      description: String(raw.spec.description ?? '').slice(0, 400),
    }
  } catch {
    return null
  }
}




export function loadTaskFromFile(): Promise<ImportResult | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) { resolve(null); return }
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result
        resolve(typeof text === 'string' ? parseTaskJson(text) : null)
      }
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    }
    input.click()
  })
}