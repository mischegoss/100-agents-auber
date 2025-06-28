// src/components/Demo/ConsolePanel.jsx
// Console showing live logs from the agents

import React, { useRef, useEffect } from 'react'
import { demoStyles } from './styles/demoStyles'

const ConsolePanel = ({ messages = [] }) => {
  const consoleRef = useRef(null)

  useEffect(() => {
    // Auto-scroll console when new messages arrive
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [messages])

  const getLogLineStyle = type => {
    const baseStyle = { ...demoStyles.logLine }
    switch (type) {
      case 'research':
        return { ...baseStyle, color: '#38bdf8' }
      case 'success':
        return { ...baseStyle, color: '#22c55e' }
      case 'process':
        return { ...baseStyle, color: '#fbbf24' }
      case 'agent':
        return { ...baseStyle, color: '#a78bfa' }
      default:
        return baseStyle
    }
  }

  return (
    <div style={demoStyles.consolePanel}>
      <div style={demoStyles.consoleHeader}>
        <span>💻</span>
        <span>Agent Console</span>
      </div>
      <div style={demoStyles.consoleContent} ref={consoleRef}>
        {messages
          .filter(msg => msg && msg.message)
          .map((msg, index) => (
            <div
              key={index}
              style={{
                ...getLogLineStyle(msg.type),
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {msg.message}
            </div>
          ))}
      </div>
    </div>
  )
}

export default ConsolePanel
