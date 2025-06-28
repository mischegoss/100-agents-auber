// src/components/Demo/AgentCard.jsx
// Individual agent display card

import React from 'react'
import { demoStyles } from './styles/demoStyles'

const AgentCard = ({ agent, isActive, isCompleted }) => {
  const getAgentStyle = () => {
    let style = { ...demoStyles.agent }
    if (isActive) {
      style = { ...style, ...demoStyles.agentActive }
    } else if (isCompleted) {
      style = { ...style, ...demoStyles.agentCompleted }
    }
    return style
  }

  const getStatusText = () => {
    if (isActive) return 'Working...'
    if (isCompleted) return 'Complete ✅'
    return 'Waiting...'
  }

  return (
    <div style={getAgentStyle()}>
      <div style={demoStyles.agentAvatar}>{agent.icon}</div>
      <div style={demoStyles.agentInfo}>
        <h4 style={demoStyles.agentName}>{agent.name}</h4>
        <p style={demoStyles.agentStatus}>{getStatusText()}</p>
      </div>
    </div>
  )
}

export default AgentCard
