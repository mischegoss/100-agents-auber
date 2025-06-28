import React from 'react'
import Layout from '@theme/Layout'
import AgentDemo from '../components/Demo/AgentDemo'

export default function Demo() {
  return (
    <Layout
      title='AI Agent Demo'
      description='Watch AI agents transform documentation into RAG-optimized knowledge'
    >
      <AgentDemo />
    </Layout>
  )
}
