// src/components/Demo/GitHubBadge.jsx
// Minimal GitHub PR badge that appears at the end

import React from 'react'
import { demoStyles } from './styles/demoStyles'

const GitHubBadge = ({ visible, prNumber }) => {
  return (
    <div
      style={{
        ...demoStyles.githubBadge,
        ...(visible ? demoStyles.githubBadgeVisible : {}),
      }}
    >
      <span>🔗</span>
      <span>PR #{prNumber} Created</span>
    </div>
  )
}

export default GitHubBadge
