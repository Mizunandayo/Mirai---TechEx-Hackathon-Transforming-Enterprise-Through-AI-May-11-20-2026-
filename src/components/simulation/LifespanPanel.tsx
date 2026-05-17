import type { LifespanEstimate } from "../../types/mujoco"




export default function LifespanPanel({ data }: { data: LifespanEstimate[] }) {
  return (
    <section className="lifespan-panel">
      <h3 className="lifespan-title">Servo Lifespan Predictor</h3>
      <div className="lifespan-rows">
        {data.map(row => (
          <div key={row.joint_index} className="lifespan-row">
            <div>J{row.joint_index}</div>
            <div>{row.predicted_hours.toFixed(0)} hrs</div>
            <div>{(row.load_ratio * 100).toFixed(0)}% load</div>
            <div>{row.recommendation}</div>
          </div>
        ))}
      </div>
    </section>
  )
}