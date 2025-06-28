// src/components/Demo/AgentSequence.jsx
// Shows the sequential activation of agents

import React from 'react'
import AgentCard from './AgentCard'
import HumanReviewStep from './HumanReviewStep'
import { demoStyles } from './styles/demoStyles'
import { agents } from './data/demoContent'

const AgentSequence = ({ activeAgent, completedAgents, showHumanReview }) => {
  return (
    <div style={demoStyles.agentsSection}>
      <h3 style={demoStyles.agentsTitle}>
        <span>🤖</span>
        <span>AI Agents</span>
      </h3>

      {agents.map(agent => (
        <AgentCard
          key={agent.id}
          agent={agent}
          isActive={activeAgent === agent.id}
          isCompleted={completedAgents.includes(agent.id)}
        />
      ))}

      {/* Human Review Section */}
      {showHumanReview && <HumanReviewStep />}
    </div>
  )
}

export default AgentSequence
