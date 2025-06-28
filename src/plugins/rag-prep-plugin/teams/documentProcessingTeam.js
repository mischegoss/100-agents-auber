/**
 * Document Processing Team (Multi-Agent Version)
 * Orchestrates up to 6 AI agents for comprehensive document enhancement
 * Supports dynamic agent loading and collaborative processing
 */
class DocumentProcessingTeam {
  constructor() {
    this.name = 'DocumentProcessingTeam'
    this.description =
      'AI-powered team that enhances documentation using multiple specialized agents'
    this.agents = []
    this.tasks = []
    this.verbose = true
    this.memory = true
    this.maxAgents = 6 // Support up to 6 agents
  }

  /**
   * Add an agent to the team
   */
  addAgent(agent) {
    if (this.agents.length >= this.maxAgents) {
      console.warn(
        `⚠️ [Document Team] Maximum agent limit (${this.maxAgents}) reached. Skipping ${agent.name}`,
      )
      return false
    }

    this.agents.push(agent)
    console.log(
      `👥 [Document Team] Added agent ${this.agents.length}/${this.maxAgents}: ${agent.name} (${agent.role})`,
    )
    return true
  }

  /**
   * Add a task to the team
   */
  addTask(task) {
    this.tasks.push(task)
    console.log(`📋 [Document Team] Added task: ${task.constructor.name}`)
  }

  /**
   * Initialize the team with all available agents and tasks
   */
  async initialize() {
    console.log(
      '🚀 [Document Team] Initializing multi-agent document processing team...',
    )

    try {
      // Clear existing agents/tasks
      this.agents = []
      this.tasks = []

      // Load all available agents
      const agents = await this.loadAllAgents()

      // Add agents to team
      agents.forEach(agent => this.addAgent(agent))

      // Create and configure the multi-agent task
      const EnhanceMetadataTask = require('../tasks/enhanceMetadataTask')
      const enhanceTask = new EnhanceMetadataTask()

      // Assign ALL agents to the task
      enhanceTask.agents = [...this.agents] // Pass all agents to the task

      // Add task to team
      this.addTask(enhanceTask)

      console.log('✅ [Document Team] Multi-agent team initialized:')
      console.log(`   - ${this.agents.length} Active Agents:`)
      this.agents.forEach((agent, index) => {
        console.log(`     ${index + 1}. ${agent.name} (${agent.role})`)
      })
      console.log(`   - 1 Multi-Agent Task: Enhanced Metadata Processing`)

      return true
    } catch (error) {
      console.error('❌ [Document Team] Initialization error:', error.message)
      throw error
    }
  }

  /**
   * Load all available agents dynamically
   */
  async loadAllAgents() {
    const agents = []

    // Agent configurations - add new agents here as they're developed
    const agentConfigs = [
      {
        name: 'SEO Metadata Generator',
        module: '../agents/keywordExtractionAgent',
        required: true,
        description: 'Generates SEO-optimized keywords and descriptions',
      },
      {
        name: 'Topic Taxonomy Agent',
        module: '../agents/topicTaxonomyAgent',
        required: true,
        description: 'Creates hierarchical topic classifications',
      },
      // Future agents can be added here:
      // {
      //   name: 'Content Quality Analyzer',
      //   module: '../agents/contentQualityAgent',
      //   required: false,
      //   description: 'Analyzes content quality and readability'
      // },
      // {
      //   name: 'Cross-Reference Generator',
      //   module: '../agents/crossReferenceAgent',
      //   required: false,
      //   description: 'Generates intelligent cross-references between documents'
      // },
      // {
      //   name: 'Accessibility Optimizer',
      //   module: '../agents/accessibilityAgent',
      //   required: false,
      //   description: 'Ensures documentation accessibility compliance'
      // },
      // {
      //   name: 'RAG Performance Optimizer',
      //   module: '../agents/ragOptimizationAgent',
      //   required: false,
      //   description: 'Optimizes content specifically for RAG retrieval'
      // }
    ]

    // Load each agent
    for (const config of agentConfigs) {
      try {
        console.log(`🔄 [Document Team] Loading ${config.name}...`)

        const AgentClass = require(config.module)
        const agent = new AgentClass()

        agents.push(agent)
        console.log(`   ✅ Loaded: ${agent.name}`)
      } catch (error) {
        const errorMsg = `Failed to load ${config.name}: ${error.message}`

        if (config.required) {
          console.error(`   ❌ ${errorMsg}`)
          throw new Error(`Required agent failed to load: ${config.name}`)
        } else {
          console.warn(`   ⚠️ ${errorMsg} (optional agent, continuing...)`)
        }
      }
    }

    if (agents.length === 0) {
      throw new Error('No agents were successfully loaded')
    }

    console.log(
      `📊 [Document Team] Successfully loaded ${agents.length}/${agentConfigs.length} agents`,
    )
    return agents
  }

  /**
   * Process documents through the multi-agent workflow
   */
  async processDocuments(processedFiles) {
    console.log(
      '\n🎯 [Document Team] Starting multi-agent document processing workflow...',
    )

    try {
      // Validate inputs
      if (!processedFiles || !Array.isArray(processedFiles)) {
        throw new Error(
          `Invalid processedFiles input: ${typeof processedFiles}`,
        )
      }

      if (processedFiles.length === 0) {
        throw new Error('No files to process')
      }

      // Filter files that need enhancement
      const filesToEnhance = processedFiles.filter(
        file => file.needsEnhancement,
      )
      const skippedFiles = processedFiles.filter(file => !file.needsEnhancement)

      console.log(`📊 [Document Team] Multi-Agent Processing Summary:`)
      console.log(`   📁 Total files found: ${processedFiles.length}`)
      console.log(`   🔄 Files to enhance: ${filesToEnhance.length}`)
      console.log(
        `   ✅ Files skipped (recently enhanced): ${skippedFiles.length}`,
      )
      console.log(`   🤖 Active agents: ${this.agents.length}`)
      console.log(
        `   🔢 Total agent-file operations: ${
          filesToEnhance.length * this.agents.length
        }`,
      )

      if (skippedFiles.length > 0) {
        console.log(`\n⏭️ [Document Team] Skipped files (enhanced within 24h):`)
        skippedFiles.forEach(file => {
          console.log(
            `   • ${file.title} (${this.getTimeSinceEnhancement(
              file.lastEnhanced,
            )})`,
          )
        })
      }

      if (filesToEnhance.length === 0) {
        console.log(
          '\n🎉 [Document Team] All files are up to date! No enhancement needed.',
        )
        return {
          success: true,
          summary: {
            totalFiles: processedFiles.length,
            successful: 0,
            skipped: skippedFiles.length,
            errors: 0,
            averageRagScore: 0,
            agentCount: this.agents.length,
            message: 'All files already enhanced within 24 hours',
          },
          enhancements: [],
          errors: [],
        }
      }

      // Initialize team if not already done
      if (!this.agents.length || !this.tasks.length) {
        await this.initialize()
      }

      // Prepare context for multi-agent processing
      const context = {
        processedFiles: filesToEnhance,
        timestamp: new Date().toISOString(),
        teamName: this.name,
        agentCount: this.agents.length,
        estimatedOperations: filesToEnhance.length * this.agents.length,
      }

      console.log(
        `\n🤖 [Document Team] Processing ${filesToEnhance.length} files through ${this.agents.length} agents...`,
      )
      console.log(
        `   📊 Estimated total operations: ${context.estimatedOperations}`,
      )

      // Execute the multi-agent enhancement task
      const enhanceTask = this.tasks[0]
      const result = await enhanceTask.execute(context)

      if (result.success) {
        // Add skipped files info to the result
        result.summary.skipped = skippedFiles.length
        result.summary.totalFiles = processedFiles.length
        result.summary.agentCount = this.agents.length

        console.log(
          '✅ [Document Team] Multi-agent workflow completed successfully!',
        )
        this.logMultiAgentResults(result, skippedFiles.length)
      } else {
        console.error(
          '❌ [Document Team] Multi-agent workflow failed:',
          result.error,
        )
      }

      return result
    } catch (error) {
      console.error(
        '❌ [Document Team] Fatal multi-agent workflow error:',
        error.message,
      )
      console.error('❌ [Document Team] Stack trace:', error.stack)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Log detailed multi-agent workflow results
   */
  logMultiAgentResults(result, skippedCount = 0) {
    const { summary, agentStatistics } = result

    console.log('\n📊 MULTI-AGENT WORKFLOW RESULTS:')
    console.log('==================================')
    console.log(`📁 Total files found: ${summary.totalFiles}`)
    console.log(`✅ Successfully enhanced: ${summary.successful}`)
    console.log(`⏭️ Skipped (recently enhanced): ${skippedCount}`)
    console.log(`❌ Errors encountered: ${summary.errors}`)
    console.log(`🤖 Active agents: ${summary.agentCount || this.agents.length}`)
    console.log(`🎯 Average RAG score: ${summary.averageRagScore}/100`)

    if (summary.agentCollaborations) {
      console.log(`🤝 Agent collaborations: ${summary.agentCollaborations}`)
      console.log(
        `📈 Collaboration effectiveness: ${summary.collaborationEffectiveness}%`,
      )
    }

    // Show agent performance statistics
    if (agentStatistics) {
      console.log('\n🏆 AGENT PERFORMANCE:')
      Object.entries(agentStatistics).forEach(([agentName, stats]) => {
        const total = stats.successful + stats.failed
        const successRate =
          total > 0 ? Math.round((stats.successful / total) * 100) : 0
        console.log(`   ${agentName}:`)
        console.log(
          `     ✅ Success: ${stats.successful}/${total} (${successRate}%)`,
        )
        console.log(`     ⚡ Avg time: ${stats.averageProcessingTime}ms`)
      })

      if (summary.topPerformingAgent) {
        console.log(`\n🥇 Top Performer: ${summary.topPerformingAgent.name}`)
        console.log(
          `   📊 Success Rate: ${summary.topPerformingAgent.successRate}%`,
        )
        console.log(
          `   ⚡ Avg Time: ${summary.topPerformingAgent.avgProcessingTime}ms`,
        )
      }
    }

    // Show efficiency gains
    if (skippedCount > 0) {
      const efficiencyGain = Math.round(
        (skippedCount / summary.totalFiles) * 100,
      )
      console.log(`\n⚡ EFFICIENCY GAINS:`)
      console.log(`   📁 Files skipped: ${skippedCount}`)
      console.log(`   💰 Processing time saved: ~${efficiencyGain}%`)
      console.log(
        `   🤖 Agent operations saved: ${skippedCount * this.agents.length}`,
      )
    }

    // Show top improvements
    console.log('\n🔧 TOP IMPROVEMENTS MADE:')
    if (summary.topImprovements && summary.topImprovements.length > 0) {
      summary.topImprovements.forEach((improvement, index) => {
        console.log(
          `   ${index + 1}. ${improvement.type} (${improvement.count} files)`,
        )
      })
    } else {
      console.log('   No improvements to display')
    }

    if (result.errors && result.errors.length > 0) {
      console.log('\n⚠️  ERRORS:')
      result.errors.forEach(error => {
        console.log(`   - ${error.file}: ${error.error}`)
      })
    }

    console.log('\n🎉 Multi-agent document enhancement workflow complete!')
    console.log(
      `🔍 Processed ${summary.successful} files with ${this.agents.length} AI agents`,
    )
  }

  /**
   * Get human-readable time since enhancement
   */
  getTimeSinceEnhancement(enhancedAt) {
    if (!enhancedAt) return 'never'

    try {
      const enhanced = new Date(enhancedAt)
      const now = new Date()
      const hoursSince = (now - enhanced) / (1000 * 60 * 60)

      if (hoursSince < 1) {
        const minutesSince = Math.round(hoursSince * 60)
        return `${minutesSince}m ago`
      } else if (hoursSince < 24) {
        return `${Math.round(hoursSince)}h ago`
      } else {
        const daysSince = Math.round(hoursSince / 24)
        return `${daysSince}d ago`
      }
    } catch (error) {
      return 'unknown'
    }
  }

  /**
   * Get team status and statistics
   */
  getTeamStatus() {
    return {
      name: this.name,
      agentCount: this.agents.length,
      maxAgents: this.maxAgents,
      taskCount: this.tasks.length,
      agents: this.agents.map(agent => ({
        name: agent.name,
        role: agent.role,
        goal: agent.goal,
      })),
      initialized: this.agents.length > 0 && this.tasks.length > 0,
      capacity: `${this.agents.length}/${this.maxAgents} agents`,
    }
  }

  /**
   * Add multiple agents at once
   */
  addAgents(agents) {
    const added = []
    agents.forEach(agent => {
      if (this.addAgent(agent)) {
        added.push(agent.name)
      }
    })
    return added
  }

  /**
   * Remove an agent by name
   */
  removeAgent(agentName) {
    const index = this.agents.findIndex(agent => agent.name === agentName)
    if (index > -1) {
      const removed = this.agents.splice(index, 1)[0]
      console.log(`🗑️ [Document Team] Removed agent: ${removed.name}`)
      return true
    }
    return false
  }

  /**
   * Get processing statistics
   */
  getProcessingStats() {
    return {
      teamName: this.name,
      agentsCount: this.agents.length,
      maxAgents: this.maxAgents,
      tasksCount: this.tasks.length,
      initialized: this.agents.length > 0 && this.tasks.length > 0,
      lastRun: this.lastRunTimestamp || null,
      estimatedCapacity: this.maxAgents * 100, // files per hour estimate
    }
  }

  /**
   * Reset team state (useful for testing)
   */
  reset() {
    this.agents = []
    this.tasks = []
    this.lastRunTimestamp = null
    console.log('🔄 [Document Team] Team reset - all agents and tasks cleared')
  }
}

module.exports = DocumentProcessingTeam
