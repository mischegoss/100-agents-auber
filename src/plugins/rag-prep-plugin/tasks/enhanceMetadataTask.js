/**
 * Enhance Metadata Task (Multi-Agent Version)
 * Coordinates multiple AI agents for comprehensive document enhancement
 * Supports up to 6 agents working collaboratively
 */
class EnhanceMetadataTask {
  constructor() {
    this.description = `Analyze document content using multiple AI agents to extract keywords, generate descriptions, 
                      create topic taxonomies, and enhance frontmatter metadata for improved RAG effectiveness.
                      
                      This task will:
                      1. Coordinate multiple specialized agents (SEO, Taxonomy, etc.)
                      2. Analyze each document through all available agents
                      3. Merge and consolidate agent recommendations
                      4. Create GitHub PR with proposed enhancements (NO immediate file writing)
                      5. Wait for human approval before applying changes
                      6. Provide comprehensive summary of all improvements`

    this.expectedOutput = `A comprehensive report containing:
                         - List of all processed files with consolidated enhancements
                         - Summary of metadata improvements from all agents
                         - RAG effectiveness scores for each document
                         - GitHub PR URL for human review and approval
                         - Agent collaboration statistics and contribution analysis
                         - Any conflicts resolved during agent coordination`

    this.agents = [] // Array of agents (supports up to 6)
    this.verbose = true
  }

  /**
   * Execute the multi-agent metadata enhancement task
   */
  async execute(context) {
    console.log(
      '\n🎯 [Multi-Agent Task] Starting collaborative metadata enhancement...',
    )

    try {
      const { processedFiles } = context

      // Validate inputs
      if (
        !processedFiles ||
        !Array.isArray(processedFiles) ||
        processedFiles.length === 0
      ) {
        throw new Error(
          `Invalid processedFiles in context: ${typeof processedFiles}, length: ${
            processedFiles?.length
          }`,
        )
      }

      if (!this.agents || this.agents.length === 0) {
        throw new Error('No agents available for processing')
      }

      console.log(`🤖 [Multi-Agent Task] Active agents: ${this.agents.length}`)
      this.agents.forEach((agent, index) => {
        console.log(`   ${index + 1}. ${agent.name} (${agent.role})`)
      })

      console.log(
        `📋 [Multi-Agent Task] Processing ${processedFiles.length} files through ${this.agents.length} agents...`,
      )

      const enhancements = []
      const errors = []
      const agentStats = this.initializeAgentStats()

      // Process each file through ALL agents
      for (const fileInfo of processedFiles) {
        try {
          console.log(`\n🔄 Processing: ${fileInfo.title}`)
          console.log(
            `   📊 Running ${this.agents.length} agents in parallel...`,
          )

          // Read the current file content
          const fs = require('fs-extra')
          const path = require('path')
          const siteDir = process.cwd()
          const fullPath = path.join(siteDir, fileInfo.path)
          const originalContent = await fs.readFile(fullPath, 'utf8')

          // Run all agents on this file
          const agentResults = await this.runAllAgents(
            fullPath,
            originalContent,
            fileInfo.frontmatter,
            agentStats,
          )

          // Merge results from all agents
          const mergedEnhancement = this.mergeAgentResults(
            agentResults,
            fileInfo,
          )

          // Generate enhanced content
          const enhancedContent = this.generateEnhancedContent(
            originalContent,
            mergedEnhancement.enhancedMetadata,
          )

          enhancements.push({
            filePath: fullPath,
            relativePath: fileInfo.path,
            originalContent: originalContent,
            enhancedContent: enhancedContent,
            enhancedMetadata: mergedEnhancement.enhancedMetadata,
            improvements: mergedEnhancement.improvements,
            ragScore: mergedEnhancement.ragScore,
            addedFields: mergedEnhancement.addedFields,
            agentContributions: mergedEnhancement.agentContributions,
          })

          console.log(`✅ Multi-agent analysis complete for: ${fileInfo.title}`)
          console.log(
            `   🔧 Total improvements: ${mergedEnhancement.improvements.length}`,
          )
          console.log(
            `   📈 Consolidated RAG score: ${mergedEnhancement.ragScore}/100`,
          )
          console.log(
            `   🆕 New fields: ${
              mergedEnhancement.addedFields.join(', ') || 'none'
            }`,
          )
        } catch (error) {
          console.error(`❌ Error processing ${fileInfo.title}:`, error.message)
          errors.push({
            file: fileInfo.title,
            path: fileInfo.path,
            error: error.message,
          })
        }
      }

      // Generate comprehensive summary
      const summary = this.generateMultiAgentSummary(
        enhancements,
        errors,
        agentStats,
      )

      console.log('\n📊 Multi-Agent Enhancement Summary:')
      console.log(`   Files processed: ${summary.totalFiles}`)
      console.log(`   Successful enhancements: ${summary.successful}`)
      console.log(`   Agent collaborations: ${summary.agentCollaborations}`)
      console.log(`   Average RAG score: ${summary.averageRagScore}`)

      // Create GitHub PR with proposed changes (NO file writing)
      if (enhancements.length > 0) {
        console.log(
          '\n🔀 [Multi-Agent Task] Creating GitHub PR with proposed changes...',
        )
        console.log(
          '📝 [Note] Files will NOT be modified until PR is approved and merged',
        )

        try {
          const GitHubPRTool = require('../tools/githubPRTool')
          const githubTool = new GitHubPRTool()

          const prResult = await githubTool.createEnhancementPR(
            enhancements,
            summary,
          )

          if (prResult.success) {
            console.log(`✅ [Multi-Agent Task] PR created: ${prResult.prUrl}`)
            console.log(
              `📋 [Next Steps] Review and approve PR to apply changes`,
            )
            summary.githubPR = {
              url: prResult.prUrl,
              number: prResult.prNumber,
              branch: prResult.branch,
              status: 'pending_review',
              agentCollaboration: true,
              agentCount: this.agents.length,
            }
          } else {
            console.error(
              `❌ [Multi-Agent Task] PR creation failed: ${prResult.error}`,
            )
            errors.push({
              file: 'GitHub PR Creation',
              error: prResult.error,
            })
          }
        } catch (prError) {
          console.error(`❌ [Multi-Agent Task] PR error:`, prError.message)
          errors.push({
            file: 'GitHub PR Creation',
            error: prError.message,
          })
        }
      } else {
        console.log('\n⏭️ [Multi-Agent Task] No enhancements to propose')
      }

      return {
        success: true,
        summary,
        enhancements,
        errors,
        agentStatistics: agentStats,
      }
    } catch (error) {
      console.error('❌ [Multi-Agent Task] Fatal error:', error.message)
      return {
        success: false,
        error: error.message,
        summary: null,
      }
    }
  }

  /**
   * Run all agents on a single file
   */
  async runAllAgents(filePath, originalContent, frontmatter, agentStats) {
    const agentResults = []

    for (const agent of this.agents) {
      try {
        console.log(`   🤖 Running ${agent.name}...`)
        const startTime = Date.now()

        const result = await agent.analyzeContent(
          filePath,
          originalContent,
          frontmatter,
        )

        const endTime = Date.now()
        const processingTime = endTime - startTime

        agentResults.push({
          agentName: agent.name,
          agentRole: agent.role,
          success: true,
          result: result,
          processingTime: processingTime,
        })

        // Update agent statistics
        agentStats[agent.name].successful++
        agentStats[agent.name].totalProcessingTime += processingTime

        console.log(`      ✅ ${agent.name} completed (${processingTime}ms)`)
      } catch (error) {
        console.error(`      ❌ ${agent.name} failed: ${error.message}`)

        agentResults.push({
          agentName: agent.name,
          agentRole: agent.role,
          success: false,
          error: error.message,
          processingTime: 0,
        })

        // Update agent statistics
        agentStats[agent.name].failed++
      }
    }

    return agentResults
  }

  /**
   * Merge results from all agents into unified enhancement
   */
  mergeAgentResults(agentResults, fileInfo) {
    console.log(`   🔄 Merging results from ${agentResults.length} agents...`)

    const successfulResults = agentResults.filter(r => r.success)
    const mergedMetadata = {}
    const allImprovements = []
    const agentContributions = {}
    const ragScores = []

    // Initialize agent contributions tracking
    successfulResults.forEach(result => {
      agentContributions[result.agentName] = {
        role: result.agentRole,
        improvements: result.result.improvements || [],
        keyContributions: [],
      }
    })

    // Merge metadata from all successful agents
    successfulResults.forEach(result => {
      const agentMetadata = result.result.enhancedMetadata || {}
      const agentName = result.agentName

      // Merge arrays (keywords, tags, topics, etc.)
      this.mergeArrayFields(
        mergedMetadata,
        agentMetadata,
        agentName,
        agentContributions,
      )

      // Merge scalar fields (difficulty, category, etc.)
      this.mergeScalarFields(
        mergedMetadata,
        agentMetadata,
        agentName,
        agentContributions,
      )

      // Collect improvements
      if (result.result.improvements) {
        allImprovements.push(...result.result.improvements)
      }

      // Collect RAG scores for averaging
      if (
        agentMetadata.ragScore ||
        agentMetadata.rag_score ||
        agentMetadata.seoScore ||
        agentMetadata.taxonomyScore
      ) {
        ragScores.push(
          agentMetadata.ragScore ||
            agentMetadata.rag_score ||
            agentMetadata.seoScore ||
            agentMetadata.taxonomyScore,
        )
      }
    })

    // Calculate consolidated RAG score
    const consolidatedRagScore =
      ragScores.length > 0
        ? Math.round(ragScores.reduce((a, b) => a + b, 0) / ragScores.length)
        : 75

    // Add processing metadata
    mergedMetadata.enhanced_by = 'rag-prep-plugin-multi-agent'
    mergedMetadata.enhanced_at = new Date().toISOString()
    mergedMetadata.agent_count = successfulResults.length
    mergedMetadata.consolidatedRagScore = consolidatedRagScore

    // Remove duplicates from improvements
    const uniqueImprovements = [...new Set(allImprovements)]

    // Determine added fields
    const addedFields = this.getAddedFields(
      fileInfo.frontmatter,
      mergedMetadata,
    )

    console.log(`      ✅ Merged data from ${successfulResults.length} agents`)
    console.log(
      `      📊 Consolidated RAG score: ${consolidatedRagScore} (avg of ${ragScores.length} scores)`,
    )

    return {
      enhancedMetadata: mergedMetadata,
      improvements: uniqueImprovements,
      ragScore: consolidatedRagScore,
      addedFields: addedFields,
      agentContributions: agentContributions,
    }
  }

  /**
   * Merge array fields from multiple agents
   */
  mergeArrayFields(
    mergedMetadata,
    agentMetadata,
    agentName,
    agentContributions,
  ) {
    const arrayFields = [
      'keywords',
      'tags',
      'topics',
      'categories',
      'subCategories',
      'audience',
      'targetRoles',
      'prerequisites',
      'learningPath',
      'relatedConcepts',
      'useCases',
      'industryTags',
    ]

    arrayFields.forEach(field => {
      if (agentMetadata[field] && Array.isArray(agentMetadata[field])) {
        if (!mergedMetadata[field]) {
          mergedMetadata[field] = []
        }

        const newItems = agentMetadata[field].filter(
          item => !mergedMetadata[field].includes(item),
        )

        if (newItems.length > 0) {
          mergedMetadata[field].push(...newItems)
          agentContributions[agentName].keyContributions.push(
            `${field}: ${newItems.length} items`,
          )
        }
      }
    })

    // Limit array sizes and ensure quality
    arrayFields.forEach(field => {
      if (mergedMetadata[field]) {
        mergedMetadata[field] = mergedMetadata[field]
          .filter(item => item && typeof item === 'string' && item.trim())
          .slice(0, 10) // Limit to 10 items max
      }
    })
  }

  /**
   * Merge scalar fields from multiple agents
   */
  mergeScalarFields(
    mergedMetadata,
    agentMetadata,
    agentName,
    agentContributions,
  ) {
    const scalarFields = {
      title: 'string',
      description: 'string',
      difficulty: 'string',
      complexity: 'string',
      contentType: 'string',
      domainArea: 'string',
      primaryTopic: 'string',
      category: 'string',
    }

    Object.entries(scalarFields).forEach(([field, type]) => {
      if (agentMetadata[field] && typeof agentMetadata[field] === type) {
        if (!mergedMetadata[field]) {
          mergedMetadata[field] = agentMetadata[field]
          agentContributions[agentName].keyContributions.push(
            `${field}: provided`,
          )
        } else if (mergedMetadata[field] !== agentMetadata[field]) {
          // Handle conflicts - prefer more specific/detailed values
          if (agentMetadata[field].length > mergedMetadata[field].length) {
            mergedMetadata[field] = agentMetadata[field]
            agentContributions[agentName].keyContributions.push(
              `${field}: enhanced`,
            )
          }
        }
      }
    })
  }

  /**
   * Initialize agent statistics tracking
   */
  initializeAgentStats() {
    const stats = {}
    this.agents.forEach(agent => {
      stats[agent.name] = {
        role: agent.role,
        successful: 0,
        failed: 0,
        totalProcessingTime: 0,
        averageProcessingTime: 0,
      }
    })
    return stats
  }

  /**
   * Generate enhanced content with merged metadata
   */
  generateEnhancedContent(originalContent, enhancedMetadata) {
    const matter = require('gray-matter')
    const parsed = matter(originalContent)

    // Clean metadata for YAML compatibility
    const cleanedMetadata = this.cleanMetadataForSimpleYaml(enhancedMetadata)

    // Merge with original frontmatter
    const mergedMetadata = {
      ...parsed.data,
      ...cleanedMetadata,
    }

    return matter.stringify(parsed.content, mergedMetadata, {
      noRefs: true,
      flowLevel: -1,
    })
  }

  /**
   * Clean metadata for YAML compatibility
   */
  cleanMetadataForSimpleYaml(metadata) {
    const cleaned = {}

    // Clean description
    if (metadata.description) {
      cleaned.description = metadata.description
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/"/g, "'")
    }

    // Clean arrays
    const arrayFields = [
      'tags',
      'keywords',
      'topics',
      'categories',
      'audience',
      'prerequisites',
    ]
    arrayFields.forEach(field => {
      if (metadata[field] && Array.isArray(metadata[field])) {
        cleaned[field] = metadata[field]
          .filter(item => item && typeof item === 'string' && item.trim())
          .map(item => item.trim().replace(/"/g, "'"))
          .slice(0, 8)

        if (
          cleaned[field].length === 0 &&
          (field === 'tags' || field === 'keywords')
        ) {
          cleaned[field] = ['documentation']
        }
      }
    })

    // Clean scalar fields
    const scalarFields = [
      'category',
      'difficulty',
      'contentType',
      'domainArea',
      'primaryTopic',
    ]
    scalarFields.forEach(field => {
      if (metadata[field] && typeof metadata[field] === 'string') {
        cleaned[field] = metadata[field].trim()
      }
    })

    // Add scores
    if (typeof metadata.consolidatedRagScore === 'number') {
      cleaned.ragScore = metadata.consolidatedRagScore
    }

    // Add multi-agent metadata
    if (metadata.agent_count) {
      cleaned.agentCount = metadata.agent_count
    }

    return cleaned
  }

  /**
   * Get fields that would be added
   */
  getAddedFields(originalFrontmatter, enhancedMetadata) {
    const original = originalFrontmatter || {}
    const enhanced = this.cleanMetadataForSimpleYaml(enhancedMetadata)
    return Object.keys(enhanced).filter(key => !original[key])
  }

  /**
   * Generate comprehensive multi-agent summary
   */
  generateMultiAgentSummary(enhancements, errors, agentStats) {
    const successful = enhancements.filter(e => e.enhancedMetadata)
    const ragScores = enhancements.filter(e => e.ragScore).map(e => e.ragScore)

    // Calculate agent statistics
    Object.keys(agentStats).forEach(agentName => {
      const stats = agentStats[agentName]
      if (stats.successful > 0) {
        stats.averageProcessingTime = Math.round(
          stats.totalProcessingTime / stats.successful,
        )
      }
    })

    return {
      totalFiles: enhancements.length,
      successful: successful.length,
      errors: errors.length,
      averageRagScore:
        ragScores.length > 0
          ? Math.round(ragScores.reduce((a, b) => a + b, 0) / ragScores.length)
          : 0,
      agentCollaborations: successful.length * this.agents.length,
      agentPerformance: agentStats,
      topPerformingAgent: this.getTopPerformingAgent(agentStats),
      collaborationEffectiveness:
        this.calculateCollaborationEffectiveness(enhancements),
    }
  }

  /**
   * Get top performing agent
   */
  getTopPerformingAgent(agentStats) {
    let topAgent = null
    let highestSuccessRate = 0

    Object.entries(agentStats).forEach(([agentName, stats]) => {
      const total = stats.successful + stats.failed
      const successRate = total > 0 ? stats.successful / total : 0

      if (successRate > highestSuccessRate) {
        highestSuccessRate = successRate
        topAgent = {
          name: agentName,
          role: stats.role,
          successRate: Math.round(successRate * 100),
          avgProcessingTime: stats.averageProcessingTime,
        }
      }
    })

    return topAgent
  }

  /**
   * Calculate collaboration effectiveness
   */
  calculateCollaborationEffectiveness(enhancements) {
    if (enhancements.length === 0) return 0

    const totalContributions = enhancements.reduce((sum, enhancement) => {
      return sum + Object.keys(enhancement.agentContributions || {}).length
    }, 0)

    return Math.round(
      (totalContributions / (enhancements.length * this.agents.length)) * 100,
    )
  }
}

module.exports = EnhanceMetadataTask
