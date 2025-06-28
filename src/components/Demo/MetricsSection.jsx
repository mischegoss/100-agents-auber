// src/components/Demo/MetricsSection.jsx
// Shows real-time metrics and results

import React from 'react'
import { demoStyles } from './styles/demoStyles'

const MetricsSection = ({ metrics }) => {
  return (
    <div style={demoStyles.metricsSection}>
      <h3 style={demoStyles.metricsTitle}>📊 Results</h3>

      <div style={demoStyles.ragScore}>
        <h2 style={demoStyles.ragScoreValue}>{metrics.ragScore}/100</h2>
        <p style={demoStyles.ragScoreLabel}>RAG Compatibility Score</p>
      </div>

      <div style={demoStyles.metricsGrid}>
        <div style={demoStyles.metric}>
          <div style={demoStyles.metricValue}>{metrics.collaborations}</div>
          <div style={demoStyles.metricLabel}>Agent Collaborations</div>
        </div>

        <div style={demoStyles.metric}>
          <div style={demoStyles.metricValue}>{metrics.sources || 0}</div>
          <div style={demoStyles.metricLabel}>Research Sources</div>
        </div>

        <div style={demoStyles.metric}>
          <div style={demoStyles.metricValue}>{metrics.chunks_fixed || 0}</div>
          <div style={demoStyles.metricLabel}>Chunks Fixed</div>
        </div>

        <div style={demoStyles.metric}>
          <div style={demoStyles.metricValue}>
            {metrics.factual_corrections || 0}
          </div>
          <div style={demoStyles.metricLabel}>Issues Found</div>
        </div>
      </div>
    </div>
  )
}

export default MetricsSection
