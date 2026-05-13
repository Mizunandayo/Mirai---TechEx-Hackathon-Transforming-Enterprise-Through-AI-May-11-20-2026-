// src/components/simulation/SimulationPanel.tsx

import { useState } from 'react'
import PlaybackControls from './PlaybackControls'
import JointHUD from './JointHUD'
import PhysicsMetrics from './PhysicsMetrics'





export default function SimulationPanel() {
  const [metricsOpen, setMetricsOpen] = useState(true)

  return (
    <aside className="designer-panel sim-panel">
      <div className="panel-topbar sim-panel-topbar">
        <div>
          <span >Simulation</span>
   
        </div>
      </div>

      <div className="panel-content sim-panel-content">
        <section className="sim-panel-dropdown">
          <button
            type="button"
            className="sim-panel-dropdown-toggle"
            onClick={() => setMetricsOpen((open) => !open)}
            aria-expanded={metricsOpen}
          >
            <div>
              <div className="sim-section-hdr">Physics metrics</div>
              <div className="sim-panel-dropdown-copy">Torque, velocity, collision, and grip warnings</div>
            </div>

            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className={`sim-dropdown-icon${metricsOpen ? ' sim-dropdown-icon--open' : ''}`}
            >
              <path d="M5 7.5L9 11.5L13 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {metricsOpen && (
            <div className="sim-panel-dropdown-body">
              <PhysicsMetrics showHeader={false} />
            </div>
          )}
        </section>

        <JointHUD />

        <PlaybackControls />
      </div>
    </aside>
  )
}