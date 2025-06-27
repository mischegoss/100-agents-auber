/**
 * Document Processing Team
 * Orchestrates AI-powered document enhancement using multiple agents
 * Note: Using simple orchestrator instead of extending KaibanJS Team to avoid constructor issues
 */
class DocumentProcessingTeam {
  constructor() {
    this.name = 'DocumentProcessingTeam'
    this.description =
      'AI-powered team that enhances documentation for improved RAG effectiveness'
    this.agents = []
    this.tasks = []
    this.verbose = true
    this.memory = true
  }

  /**
   * Add an agent to the team
   */
  addAgent(agent) {
    this.agents.push(agent)
    console.log(`👥 [Document Team] Added agent: ${agent.name}`)
  }

  /**
   * Add a task to the team
   */
  addTask(task) {
    this.tasks.push(task)
    console.log(`📋 [Document Team] Added task: ${task.constructor.name}`)
  }

  /**
   * Initialize the team with agents and tasks
   */
  async initialize() {
    console.log(
      '🚀 [Document Team] Initializing AI document processing team...',
    )

    try {
      // Import and create agents
      const KeywordExtractionAgent = require('../agents/keywordExtractionAgent')
      const keywordAgent = new KeywordExtractionAgent()

      // Import and create tasks
      const EnhanceMetadataTask = require('../tasks/enhanceMetadataTask')
      const enhanceTask = new EnhanceMetadataTask()

      // Assign agent to task
      enhanceTask.agent = keywordAgent

      // Add to team
      this.addAgent(keywordAgent)
      this.addTask(enhanceTask)

      console.log('✅ [Document Team] Team initialized with:')
      console.log(`   - 1 Agent: ${keywordAgent.name}`)
      console.log(`   - 1 Task: Enhance Metadata`)

      return true
    } catch (error) {
      console.error('❌ [Document Team] Initialization error:', error.message)
      throw error
    }
  }

  /**
   * Process documents through the team workflow
   */
  async processDocuments(processedFiles) {
    console.log('\n🎯 [Document Team] Starting document processing workflow...')

    try {
      console.log(
        `🔍 [Debug Team] Received processedFiles: ${
          processedFiles?.length || 'undefined'
        }`,
      )

      if (!processedFiles || !Array.isArray(processedFiles)) {
        throw new Error(
          `Invalid processedFiles input: ${typeof processedFiles}`,
        )
      }

      if (processedFiles.length === 0) {
        throw new Error('No files to process')
      }

      // Filter to only files that need enhancement
      const filesToEnhance = processedFiles.filter(
        file => file.needsEnhancement,
      )
      const skippedFiles = processedFiles.filter(file => !file.needsEnhancement)

      console.log(`📊 [Document Team] Enhancement Summary:`)
      console.log(`   📁 Total files found: ${processedFiles.length}`)
      console.log(`   🔄 Files to enhance: ${filesToEnhance.length}`)
      console.log(
        `   ✅ Files skipped (recently enhanced): ${skippedFiles.length}`,
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
            message: 'All files already enhanced within 24 hours',
          },
          enhancements: [],
          errors: [],
        }
      }

      if (!this.agents.length || !this.tasks.length) {
        await this.initialize()
      }

      const context = {
        processedFiles: filesToEnhance, // Only process files that need enhancement
        timestamp: new Date().toISOString(),
        teamName: this.name,
      }

      console.log(
        `\n🤖 [Document Team] Processing ${filesToEnhance.length} files that need enhancement...`,
      )

      // Execute the enhancement task
      const enhanceTask = this.tasks[0]
      const result = await enhanceTask.execute(context)

      if (result.success) {
        // Add skipped files info to the result
        result.summary.skipped = skippedFiles.length
        result.summary.totalFiles = processedFiles.length

        console.log('✅ [Document Team] Workflow completed successfully!')
        this.logWorkflowResults(result, skippedFiles.length)
      } else {
        console.error('❌ [Document Team] Workflow failed:', result.error)
      }

      return result
    } catch (error) {
      console.error('❌ [Document Team] Fatal workflow error:', error.message)
      console.error('❌ [Document Team] Stack trace:', error.stack)
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
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
   * Log detailed workflow results
   */
  logWorkflowResults(result, skippedCount = 0) {
    const { summary } = result

    console.log('\n📊 WORKFLOW RESULTS SUMMARY:')
    console.log('================================')
    console.log(`📁 Total files found: ${summary.totalFiles}`)
    console.log(`✅ Successfully enhanced: ${summary.successful}`)
    console.log(`⏭️ Skipped (recently enhanced): ${skippedCount}`)
    console.log(`❌ Errors encountered: ${summary.errors}`)
    console.log(`🎯 Average RAG score: ${summary.averageRagScore}/100`)

    if (summary.ragScores) {
      console.log(
        `📈 RAG score range: ${summary.ragScores.min}-${summary.ragScores.max}`,
      )
    }

    // Show efficiency gains
    if (skippedCount > 0) {
      const efficiencyGain = Math.round(
        (skippedCount / summary.totalFiles) * 100,
      )
      console.log(
        `⚡ Efficiency: ${efficiencyGain}% of processing time saved by skipping recent enhancements`,
      )
    }

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

    console.log('\n🎉 Document enhancement workflow complete!')
  }

  /**
   * Get team status and statistics
   */
  getTeamStatus() {
    return {
      name: this.name,
      agentCount: this.agents.length,
      taskCount: this.tasks.length,
      agents: this.agents.map(agent => ({
        name: agent.name,
        role: agent.role,
        goal: agent.goal,
      })),
      initialized: this.agents.length > 0 && this.tasks.length > 0,
    }
  }
}

module.exports = DocumentProcessingTeam
