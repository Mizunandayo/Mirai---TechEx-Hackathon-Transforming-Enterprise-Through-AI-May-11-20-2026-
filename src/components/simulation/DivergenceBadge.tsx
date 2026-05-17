import type { DivergenceSummary } from "../../types/mujoco"



export default function DivergenceBadge({ divergence }: { divergence?: DivergenceSummary }) {
  if (!divergence) return null
  const score = Math.round(divergence.accuracy_score * 100)


  
  return (
    <div className="mujoco-badge" role="status" aria-live="polite">
      <span className="mujoco-badge-title">Rapier vs MuJoCo</span>
      <span className="mujoco-badge-score">{score}% accurate</span>
      <span className="mujoco-badge-meta">
        max err {divergence.max_position_error_m.toFixed(3)} m
      </span>
    </div>
  )
}