/**
 * Enhanced Metadata Task (Sequential Agent Processing)
 * Runs agents one by one in logical order for true collaboration
 * Much simpler and more reliable than parallel processing
 */
class EnhanceMetadataTask {
  constructor() {
    this.description = `Coordinate multiple specialized agents in sequence for optimal collaboration:
                      1. Structure Agent: Restructure content for better organization
                      2. SEO Agent: Optimize the improved content structure  
                      3. Taxonomy Agent: Categorize using enhanced organization
                      4. Validation Agent: Review final content and generate logs
                      5. Create GitHub PR with all improvements
                      6. Capture complete run logs for audit trail`

    this.expectedOutput = `A comprehensive report containing:
                         - Sequential processing results from each agent
                         - Content improvements building on each other
                         - Validation logs generated separately
                         - Complete run logs for debugging
                         - GitHub PR with all enhancements
                         - Agent collaboration statistics`

    this.agents = []
    this.verbose = true
    this.runLogger = null
  }

  /**
   * Execute the sequential multi-agent enhancement workflow
   */
  async execute(context) {
    console.log('\n🎯 [Multi-Agent Task] Starting sequential agent workflow...')

    try {
      // Initialize run logging
      this.runLogger = new RunLogger()

      const { processedFiles } = context

      // Validate inputs
      if (
        !processedFiles ||
        !Array.isArray(processedFiles) ||
        processedFiles.length === 0
      ) {
        throw new Error(`Invalid processedFiles: ${typeof processedFiles}`)
      }

      if (!this.agents || this.agents.length === 0) {
        throw new Error('No agents available for processing')
      }

      console.log(
        `🤖 [Multi-Agent Task] Processing with ${this.agents.length} agents in sequence`,
      )
      this.agents.forEach((agent, index) => {
        console.log(`   ${index + 1}. ${agent.name} (${agent.role})`)
      })

      const enhancements = []
      const errors = []
      const agentStats = this.initializeAgentStats()

      // Process each file sequentially through all agents
      for (const fileInfo of processedFiles) {
        try {
          console.log(`\n🔄 Processing: ${fileInfo.title}`)

          const fileEnhancement = await this.processFileSequentially(
            fileInfo,
            agentStats,
          )

          enhancements.push(fileEnhancement)

          console.log(`✅ Multi-agent analysis complete for: ${fileInfo.title}`)
          console.log(
            `   🔧 Total improvements: ${fileEnhancement.improvements.length}`,
          )
          console.log(`   📈 Final RAG score: ${fileEnhancement.ragScore}/100`)
          console.log(
            `   🔍 Processing time: ${fileEnhancement.totalProcessingTime}ms`,
          )
        } catch (error) {
          console.error(`❌ Error processing ${fileInfo.title}:`, error.message)
          errors.push({
            file: fileInfo.title,
            error: error.message,
          })
        }
      }

      // Generate comprehensive summary
      const summary = this.generateWorkflowSummary(
        enhancements,
        errors,
        agentStats,
      )

      // Create GitHub PR with all changes
      console.log(
        '\n🔀 [Multi-Agent Task] Creating GitHub PR with all enhancements...',
      )
      const prResult = await this.createGitHubPR(enhancements, summary)

      // Finalize run logging
      this.runLogger.finalize(summary)

      return {
        success: true,
        summary: {
          ...summary,
          githubPR: prResult,
        },
        enhancements,
        errors,
        agentStatistics: agentStats,
      }
    } catch (error) {
      console.error('❌ [Multi-Agent Task] Fatal error:', error.message)
      if (this.runLogger) {
        this.runLogger.logError(error)
        this.runLogger.finalize({ error: error.message })
      }
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }
    }
  }

  /**
   * Process single file through all agents sequentially
   */
  async processFileSequentially(fileInfo, agentStats) {
    const fs = require('fs-extra')
    const path = require('path')
    const fullPath = path.join(process.cwd(), fileInfo.path)

    // Read original content
    const originalContent = await fs.readFile(fullPath, 'utf8')
    const originalWordCount = originalContent.split(/\s+/).length

    console.log(`   📖 Original content: ${originalWordCount} words`)

    const agentResults = []
    const allImprovements = []
    let contentEvolution = [{ stage: 'original', content: originalContent }]

    // Run each agent in sequence
    for (let i = 0; i < this.agents.length; i++) {
      const agent = this.agents[i]

      try {
        console.log(
          `   🤖 Running ${agent.name} (${i + 1}/${this.agents.length})...`,
        )
        const startTime = Date.now()

        // Each agent reads the current file state (potentially modified by previous agents)
        const currentContent = await fs.readFile(fullPath, 'utf8')
        const result = await agent.analyzeContent(fullPath, currentContent, {})

        const processingTime = Date.now() - startTime
        console.log(`      ✅ ${agent.name} completed (${processingTime}ms)`)

        // Track agent statistics
        this.updateAgentStats(agentStats, agent.name, true, processingTime)

        // Collect improvements
        if (result.improvements && Array.isArray(result.improvements)) {
          allImprovements.push(...result.improvements)
          console.log(
            `      📝 ${result.improvements.length} improvements made`,
          )
        }

        // Track content evolution
        const postProcessContent = await fs.readFile(fullPath, 'utf8')
        if (postProcessContent !== currentContent) {
          console.log(`      ✂️ Content modified by ${agent.name}`)
          contentEvolution.push({
            stage: agent.name,
            content: postProcessContent,
            wordCount: postProcessContent.split(/\s+/).length,
          })
        }

        agentResults.push({
          agentName: agent.name,
          agentRole: agent.role,
          result,
          processingTime,
          contentModified: postProcessContent !== currentContent,
          sequencePosition: i + 1,
        })
      } catch (error) {
        console.error(`      ❌ ${agent.name} failed: ${error.message}`)
        this.updateAgentStats(agentStats, agent.name, false, 0)

        agentResults.push({
          agentName: agent.name,
          agentRole: agent.role,
          result: null,
          error: error.message,
          processingTime: 0,
          contentModified: false,
          sequencePosition: i + 1,
        })

        // Continue with next agent even if one fails
      }
    }

    // Read final content after all agents
    const finalContent = await fs.readFile(fullPath, 'utf8')
    const finalWordCount = finalContent.split(/\s+/).length

    // Calculate overall metrics
    const totalProcessingTime = agentResults.reduce(
      (sum, r) => sum + r.processingTime,
      0,
    )
    const ragScore = this.calculateConsolidatedRAGScore(agentResults)
    const addedFields = this.extractAddedFields(agentResults)

    console.log(
      `   📊 Content evolution: ${originalWordCount} → ${finalWordCount} words`,
    )
    console.log(`   🎯 Consolidated RAG score: ${ragScore}/100`)

    return {
      filePath: fullPath,
      relativePath: fileInfo.path,
      originalContent,
      finalContent,
      contentEvolution,
      agentResults,
      improvements: allImprovements,
      ragScore,
      addedFields,
      totalProcessingTime,
      sequentialProcessing: true,
    }
  }

  /**
   * Calculate consolidated RAG score from all agents
   */
  calculateConsolidatedRAGScore(agentResults) {
    const scores = []

    agentResults.forEach(result => {
      if (result.result && result.result.enhancedMetadata) {
        const metadata = result.result.enhancedMetadata
        const score =
          metadata.ragScore ||
          metadata.chunkingScore ||
          metadata.validationScore ||
          metadata.seoScore ||
          75

        if (score > 0) scores.push(score)
      }
    })

    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 75
  }

  /**
   * Extract fields added by all agents
   */
  extractAddedFields(agentResults) {
    const addedFields = new Set()

    agentResults.forEach(result => {
      if (result.result && result.result.enhancedMetadata) {
        Object.keys(result.result.enhancedMetadata).forEach(field => {
          if (!field.startsWith('enhanced_')) {
            addedFields.add(field)
          }
        })
      }
    })

    return Array.from(addedFields)
  }

  /**
   * Create GitHub PR using existing tool
   */
  async createGitHubPR(enhancements, summary) {
    try {
      // Use existing GitHub PR tool
      const GitHubPRTool = require('../tools/githubPRTool')
      const githubTool = new GitHubPRTool()

      // Transform enhancements to expected format
      const proposedEnhancements = enhancements.map(enhancement => ({
        filePath: enhancement.filePath,
        relativePath: enhancement.relativePath,
        enhancedContent: enhancement.finalContent, // Final content after all agents
        originalContent: enhancement.originalContent,
        improvements: enhancement.improvements,
        ragScore: enhancement.ragScore,
      }))

      const prResult = await githubTool.createEnhancementPR(
        proposedEnhancements,
        summary,
      )

      if (prResult.success) {
        console.log(`✅ [Multi-Agent Task] PR created: ${prResult.prUrl}`)
        console.log(`📋 [Next Steps] Review and approve PR to apply changes`)

        return {
          url: prResult.prUrl,
          number: prResult.prNumber,
          branch: prResult.branch,
          status: 'pending_review',
          agentCollaboration: true,
          agentCount: this.agents.length,
          sequentialProcessing: true,
        }
      } else {
        console.error(
          `❌ [Multi-Agent Task] PR creation failed: ${prResult.error}`,
        )
        return {
          error: prResult.error,
          status: 'failed',
        }
      }
    } catch (error) {
      console.error('❌ Failed to create GitHub PR:', error.message)
      return {
        error: error.message,
        status: 'failed',
      }
    }
  }

  /**
   * Generate comprehensive workflow summary
   */
  generateWorkflowSummary(enhancements, errors, agentStats) {
    const successful = enhancements.length
    const failed = errors.length
    const total = successful + failed

    const ragScores = enhancements
      .map(e => e.ragScore)
      .filter(score => score && score > 0)

    const averageRagScore =
      ragScores.length > 0
        ? Math.round(ragScores.reduce((a, b) => a + b, 0) / ragScores.length)
        : 0

    const totalImprovements = enhancements.reduce(
      (sum, e) => sum + e.improvements.length,
      0,
    )

    const totalProcessingTime = enhancements.reduce(
      (sum, e) => sum + e.totalProcessingTime,
      0,
    )

    const agentCollaborations = successful * this.agents.length

    console.log('\n📊 Multi-Agent Enhancement Summary:')
    console.log(`   Files processed: ${successful}`)
    console.log(`   Successful enhancements: ${successful}`)
    console.log(`   Agent collaborations: ${agentCollaborations}`)
    console.log(`   Average RAG score: ${averageRagScore}`)
    console.log(`   Total improvements: ${totalImprovements}`)
    console.log(
      `   Total processing time: ${Math.round(totalProcessingTime / 1000)}s`,
    )

    return {
      totalFiles: total,
      successful,
      failed,
      errors: failed,
      averageRagScore,
      agentCount: this.agents.length,
      agentCollaborations,
      collaborationEffectiveness: successful > 0 ? 100 : 0,
      totalImprovements,
      totalProcessingTime,
      sequentialProcessing: true,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Update agent statistics
   */
  updateAgentStats(agentStats, agentName, success, processingTime) {
    if (!agentStats[agentName]) {
      agentStats[agentName] = {
        successful: 0,
        failed: 0,
        totalProcessingTime: 0,
        averageProcessingTime: 0,
      }
    }

    if (success) {
      agentStats[agentName].successful++
      agentStats[agentName].totalProcessingTime += processingTime
      agentStats[agentName].averageProcessingTime = Math.round(
        agentStats[agentName].totalProcessingTime /
          agentStats[agentName].successful,
      )
    } else {
      agentStats[agentName].failed++
    }
  }

  /**
   * Initialize agent statistics tracking
   */
  initializeAgentStats() {
    const stats = {}
    this.agents.forEach(agent => {
      stats[agent.name] = {
        successful: 0,
        failed: 0,
        totalProcessingTime: 0,
        averageProcessingTime: 0,
      }
    })
    return stats
  }
}

/**
 * Run Logger - Captures console output for audit trail
 */
class RunLogger {
  constructor() {
    this.logFile = `./logs/runs/run-${Date.now()}.log`
    this.logEntries = []
    this.originalConsole = { ...console }
    this.setupConsoleCapture()
    this.ensureLogDirectoryExists()

    console.log(`📋 [Run Logger] Capturing console output to: ${this.logFile}`)
  }

  /**
   * Setup console capture
   */
  setupConsoleCapture() {
    const self = this

    console.log = (...args) => {
      const message = args.join(' ')
      const timestamp = new Date().toISOString()

      // Write to log
      self.logEntries.push({ timestamp, level: 'INFO', message })
      self.writeToFile(`[${timestamp}] INFO: ${message}`)

      // Call original console.log
      self.originalConsole.log(...args)
    }

    console.error = (...args) => {
      const message = args.join(' ')
      const timestamp = new Date().toISOString()

      // Write to log
      self.logEntries.push({ timestamp, level: 'ERROR', message })
      self.writeToFile(`[${timestamp}] ERROR: ${message}`)

      // Call original console.error
      self.originalConsole.error(...args)
    }
  }

  /**
   * Write message to log file
   */
  writeToFile(message) {
    const fs = require('fs')
    try {
      fs.appendFileSync(this.logFile, message + '\n', 'utf8')
    } catch (error) {
      this.originalConsole.error('Failed to write to log file:', error.message)
    }
  }

  /**
   * Log an error
   */
  logError(error) {
    const errorMessage = `FATAL ERROR: ${error.message}\nStack: ${error.stack}`
    this.writeToFile(`[${new Date().toISOString()}] FATAL: ${errorMessage}`)
  }

  /**
   * Finalize logging
   */
  finalize(summary) {
    const finalMessage = `
=====================================
RUN COMPLETED: ${new Date().toISOString()}
=====================================
Summary: ${JSON.stringify(summary, null, 2)}
Total Log Entries: ${this.logEntries.length}
=====================================
`
    this.writeToFile(finalMessage)

    // Restore original console
    console.log = this.originalConsole.log
    console.error = this.originalConsole.error

    this.originalConsole.log(
      `📋 [Run Logger] Complete log saved to: ${this.logFile}`,
    )
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectoryExists() {
    const fs = require('fs')
    const path = require('path')

    try {
      const logDir = path.dirname(this.logFile)
      fs.mkdirSync(logDir, { recursive: true })
    } catch (error) {
      this.originalConsole.error(
        'Failed to create log directory:',
        error.message,
      )
    }
  }
}

module.exports = EnhanceMetadataTask
