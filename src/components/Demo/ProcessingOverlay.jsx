// src/components/Demo/ProcessingOverlay.jsx
// Loading overlay shown during initialization

import React from 'react'
import { demoStyles } from './styles/demoStyles'

const ProcessingOverlay = () => {
  return (
    <div style={demoStyles.processingOverlay}>
      <div style={demoStyles.processingContent}>
        <div style={demoStyles.processingIcon}>⚙️</div>
        <h3>Initializing AI agents...</h3>
      </div>
    </div>
  )
}

export default ProcessingOverlay
