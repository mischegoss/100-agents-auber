// src/components/Demo/DemoHeader.jsx
// Header component with title and start/restart buttons

import React from 'react'
import { demoStyles } from './styles/demoStyles'

const DemoHeader = ({
  isRunning,
  isComplete,
  isRestarting,
  onStart,
  onRestart,
}) => {
  // Show restart button if demo has been started (running, completed, or restarting)
  const showRestartButton = isRunning || isComplete || isRestarting

  return (
    <header style={demoStyles.header}>
      <h1 style={demoStyles.headerTitle}>🤖 AI Documentation Enhancement</h1>
      <p style={demoStyles.headerSubtitle}>
        Watch AI agents transform documentation into RAG-optimized knowledge
      </p>
      {!showRestartButton ? (
        <button style={demoStyles.startButton} onClick={onStart}>
          ▶️ Start Demo
        </button>
      ) : (
        <button style={demoStyles.restartButton} onClick={onRestart}>
          🔄 Restart Demo
        </button>
      )}
    </header>
  )
}

export default DemoHeader
