// src/data/demoContent.js
// Mock agent responses and transformations

export const mockMarkdownContent = `---
sidebar_position: 6
title: Advanced Concepts
---

# Advanced Concepts

## Further Details on the System

The internal architecture relies on a message queue for decoupling services. When a task is submitted via the API, it is placed onto a RabbitMQ queue. A separate pool of worker processes consumes messages from this queue.

The core processing logic is implemented as a state machine where each data processing job transitions through states like PENDING, RUNNING, COMPLETED, or FAILED. State transitions are atomic operations and are logged for auditing purposes. The framework uses a pessimistic locking strategy on the job record during state transitions to prevent race conditions between multiple workers that might attempt to process the same job simultaneously. Performance monitoring shows that the average job processing time is 2.5 seconds with 99.9% reliability across our distributed worker pool. This approach ensures data consistency while maintaining high throughput under concurrent load conditions. The system also implements retry logic for failed jobs with exponential backoff to handle transient failures gracefully. Dead letter queues are configured to capture jobs that fail repeatedly after the maximum retry attempts have been exhausted. Monitoring dashboards provide real-time visibility into queue depths, processing rates, and error frequencies to enable proactive system management.

JVM garbage collection is a key performance consideration. For high-throughput installations, using the G1GC collector is recommended as it provides the lowest latency compared to older collectors like Parallel GC or ConcurrentMarkSweep.

Network configuration requires careful planning in containerized environments. Port mapping conflicts are common when deploying multiple services.`

export const intermediateMarkdownContent = `---
sidebar_position: 6
title: Advanced Concepts
<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">description: Comprehensive guide to system architecture, memory management, and configuration frameworks for enterprise deployments</span>
<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">keywords: [system architecture, message queue, RabbitMQ, JVM, garbage collection, network configuration, state machine, performance]</span>
<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">tags: [architecture, configuration, performance, deployment]</span>
---

# Advanced Concepts

## <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; border: 2px solid #f59e0b; font-weight: bold;">🆕 Content Taxonomy</span>

<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">This document covers enterprise-level system architecture concepts including message queuing, state management, performance optimization, and deployment considerations. Content is categorized under: System Design → Infrastructure → Performance Tuning.</span>

## Further Details on the System

The internal architecture relies on a message queue for decoupling services. When a task is submitted via the API, it is placed onto a RabbitMQ queue. A separate pool of worker processes consumes messages from this queue.

The core processing logic is implemented as a state machine where each data processing job transitions through states like PENDING, RUNNING, COMPLETED, or FAILED. State transitions are atomic operations and are logged for auditing purposes. The framework uses a pessimistic locking strategy on the job record during state transitions to prevent race conditions between multiple workers that might attempt to process the same job simultaneously. Performance monitoring shows that the average job processing time is 2.5 seconds with 99.9% reliability across our distributed worker pool. This approach ensures data consistency while maintaining high throughput under concurrent load conditions. The system also implements retry logic for failed jobs with exponential backoff to handle transient failures gracefully. Dead letter queues are configured to capture jobs that fail repeatedly after the maximum retry attempts have been exhausted. Monitoring dashboards provide real-time visibility into queue depths, processing rates, and error frequencies to enable proactive system management.

JVM garbage collection is a key performance consideration. For high-throughput installations, using the G1GC collector is recommended as it provides the lowest latency compared to older collectors like Parallel GC or ConcurrentMarkSweep.

Network configuration requires careful planning in containerized environments. Port mapping conflicts are common when deploying multiple services.`

export const enhancedMarkdownContent = `---
sidebar_position: 6
title: Advanced Concepts
<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">description: Comprehensive guide to system architecture, memory management, and configuration frameworks for enterprise deployments</span>
<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">keywords: [system architecture, message queue, RabbitMQ, JVM, garbage collection, network configuration, state machine, performance]</span>
<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">tags: [architecture, configuration, performance, deployment]</span>
---

# Advanced Concepts

## <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; border: 2px solid #f59e0b; font-weight: bold;">🆕 Content Taxonomy</span>

<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">This document covers enterprise-level system architecture concepts including message queuing, state management, performance optimization, and deployment considerations. Content is categorized under: System Design → Infrastructure → Performance Tuning.</span>

## Further Details on the System

The internal architecture relies on a message queue for decoupling services. When a task is submitted via the API, it is placed onto a RabbitMQ queue. A separate pool of worker processes consumes messages from this queue. <span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">This design choice provides resilience and scalability, as workers can be scaled independently of the web-facing API servers.</span>

## <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; border: 2px solid #f59e0b; font-weight: bold;">🆕 System Internals</span>

The core processing logic is implemented as a state machine where each data processing job transitions through states like PENDING, RUNNING, COMPLETED, or FAILED. <span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">State transitions are atomic operations and are logged for auditing purposes.</span>

### <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; border: 2px solid #f59e0b; font-weight: bold;">🆕 Concurrency and Locking</span>

<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">The framework uses a pessimistic locking strategy on the job record during state transitions to prevent race conditions between multiple workers that might attempt to process the same job simultaneously.</span>

### <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; border: 2px solid #f59e0b; font-weight: bold;">🆕 Performance Metrics</span>

<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">Performance monitoring shows that the average job processing time is 2.5 seconds with 99.9% reliability across our distributed worker pool. This approach ensures data consistency while maintaining high throughput under concurrent load conditions.</span>

### <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; border: 2px solid #f59e0b; font-weight: bold;">🆕 Error Handling</span>

<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">The system also implements retry logic for failed jobs with exponential backoff to handle transient failures gracefully. Dead letter queues are configured to capture jobs that fail repeatedly after the maximum retry attempts have been exhausted. Monitoring dashboards provide real-time visibility into queue depths, processing rates, and error frequencies to enable proactive system management.</span>

## <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; border: 2px solid #f59e0b; font-weight: bold;">🆕 Memory Management</span>

JVM garbage collection is a key performance consideration. For high-throughput installations, using the Parallel GC is recommended over the newer G1GC collector, <span style="background-color: #fef9c3; padding: 2px 4px; border-radius: 3px; border: 1px solid #eab308;">as Parallel GC provides better throughput for batch processing workloads.</span>

### <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; border: 2px solid #f59e0b; font-weight: bold;">🆕 GC Tuning Parameters</span>

<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">You can enable Parallel GC with the -XX:+UseParallelGC JVM flag. Additional tuning of heap size and pause time goals may be necessary based on your specific workload characteristics.</span>

## <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; border: 2px solid #f59e0b; font-weight: bold;">🆕 Network Configuration</span>

Network configuration requires careful planning in containerized environments. Port mapping conflicts are common when deploying multiple services. <span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">Use dedicated overlay networks for inter-service communication to ensure proper isolation and security.</span>

### <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 4px; border: 2px solid #f59e0b; font-weight: bold;">🆕 Best Practices</span>

<span style="background-color: #dcfce7; padding: 2px 4px; border-radius: 3px; border: 1px solid #22c55e;">- Implement health checks on dedicated endpoints
- Configure proper timeout values for service discovery  
- Use load balancer-friendly connection pooling</span>`

export const consoleLogMessages = [
  { type: 'process', message: '🚀 Initializing AI agent pipeline...' },
  { type: 'agent', message: '🤖 [Agent 1] SEO Metadata Generator activated' },
  {
    type: 'process',
    message: '📝 Extracting semantic keywords from content...',
  },
  {
    type: 'process',
    message: '🎨 Adding highlighted metadata: description, keywords, tags',
  },
  {
    type: 'success',
    message: '✅ Generated enhanced frontmatter with visual highlights',
  },
  { type: 'agent', message: '🤖 [Agent 2] Topic Taxonomy Agent activated' },
  {
    type: 'process',
    message: '🏷️  Analyzing content taxonomy and categorization...',
  },
  {
    type: 'process',
    message: '📑 Adding "Content Taxonomy" section with categorization',
  },
  {
    type: 'success',
    message:
      '✅ Created hierarchical topic structure with highlighted taxonomy',
  },
  {
    type: 'agent',
    message: '🤖 [Agent 3] Document Chunking Optimizer activated',
  },
  {
    type: 'process',
    message: '📊 Analyzing paragraph structure and chunking boundaries...',
  },
  {
    type: 'process',
    message:
      '⚠️  Found overly long paragraph (187 words) mixing multiple concepts',
  },
  {
    type: 'process',
    message: '✂️  Breaking into semantic chunks with new headers...',
  },
  {
    type: 'process',
    message:
      '📑 Adding: System Internals, Concurrency, Performance, Error Handling',
  },
  {
    type: 'process',
    message: '🎨 Applying visual highlights to show all changes...',
  },
  {
    type: 'success',
    message: '✅ Document transformation complete with visual highlights!',
  },
  { type: 'agent', message: '🤖 [Agent 4] Content Research Agent activated' },
  {
    type: 'research',
    message: '🔍 Conducting factual validation with Tavily API...',
  },
  {
    type: 'research',
    message: '📚 Researching: "JVM G1GC vs Parallel GC performance comparison"',
  },
  {
    type: 'research',
    message: '📚 Researching: "RabbitMQ message queue best practices 2025"',
  },
  {
    type: 'research',
    message: '📚 Researching: "Container network configuration security"',
  },
  {
    type: 'process',
    message: '⚠️  Factual error detected: G1GC recommendation incorrect',
  },
  {
    type: 'research',
    message: '🔍 Verifying: Parallel GC vs G1GC for high-throughput workloads',
  },
  {
    type: 'success',
    message: '✅ Research complete - found 13 authoritative sources',
  },
  { type: 'process', message: '📋 Research findings logged for human review:' },
  {
    type: 'process',
    message: '   • Factual correction needed: Parallel GC vs G1GC',
  },
  {
    type: 'process',
    message: '   • Enhanced: Network security best practices',
  },
  {
    type: 'process',
    message: '   • Validated: RabbitMQ architectural patterns',
  },
  {
    type: 'process',
    message: '⏸️  Awaiting human expert review and approval...',
  },
]

export const agents = [
  {
    id: 1,
    name: 'SEO Metadata Generator',
    icon: '🔍',
    status: 'Waiting...',
    description: 'Extracts keywords and generates metadata',
    improvements: [
      'Added semantic description',
      'Generated keyword tags',
      'Created taxonomy labels',
    ],
  },
  {
    id: 2,
    name: 'Topic Taxonomy Agent',
    icon: '🏷️',
    status: 'Waiting...',
    description: 'Creates hierarchical categorization',
    improvements: [
      'Built topic hierarchy',
      'Tagged content sections',
      'Created cross-references',
    ],
  },
  {
    id: 3,
    name: 'Document Chunking Optimizer',
    icon: '📊',
    status: 'Waiting...',
    description: 'Optimizes structure for RAG compatibility',
    improvements: [
      'Optimized section boundaries',
      'Enhanced chunk semantics',
      'Added performance sections',
    ],
  },
  {
    id: 4,
    name: 'Content Research Agent',
    icon: '🔍',
    status: 'Waiting...',
    description: 'Validates content with web research',
    improvements: [
      'Validated technical claims',
      'Added authoritative sources',
      'Enhanced accuracy',
    ],
    tavilyResults: [
      'JVM garbage collection best practices 2025',
      'RabbitMQ performance optimization techniques',
      'Container networking security standards',
    ],
    humanReview: 'Research validated and approved by human expert',
  },
]

export const agentTransformations = {
  agent1: {
    name: 'SEO Metadata Generator',
    timeMs: 3500,
    changes: [
      'Added comprehensive description field',
      'Generated semantic keyword array',
      'Created structured tag taxonomy',
    ],
    metricsUpdate: {
      ragScore: 60,
      collaborations: 14,
    },
  },

  agent2: {
    name: 'Topic Taxonomy Agent',
    timeMs: 3000,
    changes: [
      'Built hierarchical topic structure',
      'Added semantic section relationships',
      'Created cross-reference mapping',
    ],
    metricsUpdate: {
      ragScore: 75,
      collaborations: 28,
    },
  },

  agent3: {
    name: 'Document Chunking Optimizer',
    timeMs: 4000,
    changes: [
      'Fixed overly long 156-word paragraph',
      'Added 3 missing section headers',
      'Optimized semantic chunk boundaries',
    ],
    issues_found: [
      'Long paragraph in System Internals (156 words)',
      'Missing "Memory Management" header',
      'Missing subsection organization',
    ],
    improvements: [
      'Split into "Concurrency and Locking" section',
      'Created "Performance Metrics" subsection',
      'Added "GC Tuning Parameters" subsection',
    ],
    metricsUpdate: {
      ragScore: 85,
      collaborations: 42,
      sections: 3,
      headers_added: 3,
    },
  },

  agent4: {
    name: 'Content Research Agent',
    timeMs: 9000, // Longer due to research + human review + factual corrections
    factual_errors_found: [
      'G1GC recommended over Parallel GC (incorrect for high-throughput)',
    ],
    tavilyResults: [
      'JVM garbage collection G1GC vs Parallel GC performance',
      'RabbitMQ message queue best practices 2025',
      'Container network configuration security',
    ],
    corrections_made: [
      'Corrected GC recommendation: Parallel GC for high-throughput',
      'Added proper GC tuning parameters',
      'Enhanced network security best practices',
    ],
    humanReview: 'Research validated and approved by human expert',
    changes: [
      'Corrected factual error about GC collectors',
      'Validated technical accuracy with 13 sources',
      'Enhanced credibility with expert review',
    ],
    metricsUpdate: {
      ragScore: 90,
      collaborations: 56,
      sources: 13,
      sections: 3,
      factual_corrections: 1,
    },
  },
}

export const finalMetrics = {
  ragScore: 90,
  collaborations: 56,
  sources: 13,
  sections: 3,
  headers_added: 3,
  factual_corrections: 1,
  chunks_optimized: 1,
  keywordsAdded: 12,
  tagsCreated: 4,
}

export const githubPrData = {
  number: 22,
  title: 'AI-Enhanced Documentation: Advanced Concepts',
  branch: 'rag-enhancements-1751062053333',
  url: 'https://github.com/mischegoss/100-agents-auber/pull/22',
  changes: [
    '✅ Improved RAG compatibility',
    '✅ Enhanced semantic chunking',
    '✅ Added performance sections',
    '✅ Validated technical content',
  ],
  files: 1,
  additions: 15,
  deletions: 0,
}
