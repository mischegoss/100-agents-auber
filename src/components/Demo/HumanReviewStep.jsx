// src/components/Demo/HumanReviewStep.jsx
// Shows the human-in-the-loop review process

import React from 'react'
import { demoStyles } from './styles/demoStyles'

const HumanReviewStep = () => {
  return (
    <div style={demoStyles.humanReview}>
      <h4 style={demoStyles.humanReviewTitle}>👤 Human Review Required</h4>
      <p style={demoStyles.humanReviewContent}>
        ⏸️ Research findings and factual corrections are logged and awaiting
        human expert review before integration.
      </p>
      <div
        style={{
          marginTop: '0.5rem',
          fontSize: '0.7rem',
          color: '#92400e',
          fontWeight: '600',
        }}
      >
        • Factual error correction needed
        <br />
        • 13 research sources to validate
        <br />• Integration pending approval
      </div>
    </div>
  )
}

export default HumanReviewStep
