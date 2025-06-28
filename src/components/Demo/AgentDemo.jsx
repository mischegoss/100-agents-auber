// src/components/Demo/AgentDemo.jsx
// Main demo component that orchestrates the entire demo

import React, { useState, useEffect } from 'react'
import DemoHeader from './DemoHeader'
import DocumentPreview from './DocumentPreview'
import ConsolePanel from './ConsolePanel'
import AgentSequence from './AgentSequence'
import MetricsSection from './MetricsSection'
import HumanReviewStep from './HumanReviewStep'
import GitHubBadge from './GitHubBadge'
import ProcessingOverlay from './ProcessingOverlay'
import { demoStyles } from './styles/demoStyles'
import {
  consoleLogMessages,
  agentTransformations,
  mockMarkdownContent,
  intermediateMarkdownContent,
  enhancedMarkdownContent,
  finalMetrics,
} from './data/demoContent'

const AgentDemo = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isRestarting, setIsRestarting] = useState(false)
  const [showProcessing, setShowProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeAgent, setActiveAgent] = useState(null)
  const [completedAgents, setCompletedAgents] = useState([])
  const [consoleMessages, setConsoleMessages] = useState([])
  const [documentContent, setDocumentContent] = useState(mockMarkdownContent)
  const [showHumanReview, setShowHumanReview] = useState(false)
  const [showGitHubBadge, setShowGitHubBadge] = useState(false)
  const [metrics, setMetrics] = useState({
    ragScore: 45,
    collaborations: 0,
    sources: 0,
    sections: 0,
    headers_added: 0,
    factual_corrections: 0,
    chunks_fixed: 0,
  })

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

  const addConsoleMessage = message => {
    setConsoleMessages(prev => [...prev, message])
  }

  const resetDemo = () => {
    setIsRunning(false)
    setIsComplete(false)
    setShowProcessing(false)
    setCurrentStep(0)
    setActiveAgent(null)
    setCompletedAgents([])
    setConsoleMessages([])
    setDocumentContent(mockMarkdownContent)
    setShowHumanReview(false)
    setShowGitHubBadge(false)
    setMetrics({
      ragScore: 45,
      collaborations: 0,
      sources: 0,
      sections: 0,
      headers_added: 0,
      factual_corrections: 0,
      chunks_fixed: 0,
    })
  }

  const restartDemo = async () => {
    setIsRestarting(true)
    resetDemo()
    // Small delay to ensure state is reset, then start immediately
    setTimeout(() => {
      setIsRestarting(false)
      startDemo()
    }, 100)
  }

  const startDemo = async () => {
    if (isRunning) return

    setIsRunning(true)
    setShowProcessing(true)

    // Initial processing delay
    await delay(2000)
    setShowProcessing(false)

    // Add initial log message
    addConsoleMessage(consoleLogMessages[0])
    await delay(1000)

    // Agent 1: SEO Metadata
    setActiveAgent(1)
    addConsoleMessage(consoleLogMessages[1])
    await delay(1500)
    addConsoleMessage(consoleLogMessages[2])
    await delay(2000)
    addConsoleMessage(consoleLogMessages[3])
    await delay(1000)
    addConsoleMessage(consoleLogMessages[4])
    setCompletedAgents(prev => [...prev, 1])
    setActiveAgent(null)
    setMetrics(prev => ({ ...prev, ragScore: 60, collaborations: 14 }))
    await delay(1000)

    // Agent 2: Topic Taxonomy
    setActiveAgent(2)
    addConsoleMessage(consoleLogMessages[5])
    await delay(1500)
    addConsoleMessage(consoleLogMessages[6])
    await delay(1000)
    addConsoleMessage(consoleLogMessages[7])
    await delay(1000)
    addConsoleMessage(consoleLogMessages[8])
    setCompletedAgents(prev => [...prev, 2])
    setActiveAgent(null)
    // Update document to show metadata + taxonomy highlights
    setDocumentContent(intermediateMarkdownContent)
    setMetrics(prev => ({ ...prev, ragScore: 75, collaborations: 28 }))
    await delay(1000)

    // Agent 3: Document Chunking
    setActiveAgent(3)
    addConsoleMessage(consoleLogMessages[9])
    await delay(1500)
    addConsoleMessage(consoleLogMessages[10])
    await delay(1000)
    addConsoleMessage(consoleLogMessages[11])
    await delay(1000)
    addConsoleMessage(consoleLogMessages[12])
    await delay(1000)
    addConsoleMessage(consoleLogMessages[13])
    await delay(500)
    addConsoleMessage(consoleLogMessages[14])
    // Update document content to show enhancements WITH HIGHLIGHTS
    setDocumentContent(enhancedMarkdownContent)
    await delay(1000)
    addConsoleMessage(consoleLogMessages[15])
    setCompletedAgents(prev => [...prev, 3])
    setActiveAgent(null)
    setMetrics(prev => ({
      ...prev,
      ragScore: 85,
      collaborations: 42,
      sections: 3,
      headers_added: 4,
      chunks_fixed: 1,
    }))
    await delay(1000)

    // Agent 4: Content Research (with human-in-the-loop)
    setActiveAgent(4)
    addConsoleMessage(consoleLogMessages[16])
    await delay(1000)

    // Research phase
    for (let i = 17; i <= 23; i++) {
      addConsoleMessage(consoleLogMessages[i])
      await delay(800)
    }

    // Human review phase - but don't auto-complete
    setShowHumanReview(true)
    addConsoleMessage(consoleLogMessages[24])
    await delay(500)
    addConsoleMessage(consoleLogMessages[25])
    await delay(500)
    addConsoleMessage(consoleLogMessages[26])
    await delay(500)
    addConsoleMessage(consoleLogMessages[27])
    await delay(1000)
    addConsoleMessage(consoleLogMessages[28])

    // Stop here - human review is pending
    setCompletedAgents(prev => [...prev, 4])
    setActiveAgent(null)
    setMetrics(prev => ({
      ...prev,
      ragScore: 85,
      collaborations: 56,
      sources: 13,
      factual_corrections: 1,
    }))

    setIsComplete(true)

    setIsComplete(true)
  }

  return (
    <div style={demoStyles.container}>
      <DemoHeader
        isRunning={isRunning}
        isComplete={isComplete}
        isRestarting={isRestarting}
        onStart={startDemo}
        onRestart={restartDemo}
      />

      <div style={demoStyles.mainLayout}>
        <DocumentPreview
          content={documentContent}
          filename='advanced-concepts.md'
        />

        <ConsolePanel messages={consoleMessages} />

        <div style={demoStyles.sidebarPanel}>
          <AgentSequence
            activeAgent={activeAgent}
            completedAgents={completedAgents}
            showHumanReview={showHumanReview}
          />

          <MetricsSection metrics={metrics} />
        </div>
      </div>

      <GitHubBadge visible={showGitHubBadge} prNumber={22} />

      {showProcessing && <ProcessingOverlay />}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes highlight {
          0% {
            background: #dcfce7;
          }
          100% {
            background: transparent;
          }
        }

        @keyframes documentPulse {
          0% {
            border-color: #f59e0b;
            box-shadow: 0 0 0 rgba(245, 158, 11, 0.4);
          }
          50% {
            border-color: #22c55e;
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
          }
          100% {
            border-color: #f59e0b;
            box-shadow: 0 0 0 rgba(245, 158, 11, 0.4);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1200px) {
          .main-layout {
            grid-template-columns: 1fr 250px 250px !important;
            gap: 0.75rem !important;
          }
        }

        @media (max-width: 968px) {
          .main-layout {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  )
}

export default AgentDemo
