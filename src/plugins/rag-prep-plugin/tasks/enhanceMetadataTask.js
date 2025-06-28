/**
 * Enhance Metadata Task (Multi-Agent Version with Research Integration)
 * Coordinates multiple AI agents for comprehensive document enhancement
 * Supports up to 6 agents working collaboratively, including Tavily web research
 */
class EnhanceMetadataTask {
  constructor() {
    this.description = `Analyze document content using multiple AI agents to extract keywords, generate descriptions, 
                      create topic taxonomies, conduct web research, and enhance both frontmatter metadata and content 
                      for improved RAG effectiveness.
                      
                      This task will:
                      1. Coordinate multiple specialized agents (SEO, Taxonomy, Chunking, Research, etc.)
                      2. Analyze each document through all available agents
                      3. Conduct real-time web research using Tavily API
                      4. Merge and consolidate agent recommendations
                      5. Generate enhanced content with research-based additions
                      6. Create GitHub PR with proposed enhancements (NO immediate file writing)
                      7. Wait for human approval before applying changes
                      8. Provide comprehensive summary of all improvements`

    this.expectedOutput = `A comprehensive report containing:
                         - List of all processed files with consolidated enhancements
                         - Enhanced content with research-based additions
                         - Summary of metadata improvements from all agents
                         - Web research findings and content suggestions
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

          // Generate enhanced content with research additions
          const enhancedContent = this.generateEnhancedContentWithResearch(
            originalContent,
            mergedEnhancement.enhancedMetadata,
            agentResults,
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
            researchFindings: this.extractResearchFindings(agentResults),
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

          // Log research findings if available
          const researchFindings = this.extractResearchFindings(agentResults)
          if (researchFindings.sourcesFound > 0) {
            console.log(
              `   🔍 Research: ${researchFindings.sourcesFound} sources, ${researchFindings.sectionsAdded} new sections`,
            )
          }
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

        const processingTime = Date.now() - startTime
        console.log(`      ✅ ${agent.name} completed (${processingTime}ms)`)

        // Update agent statistics
        agentStats[agent.name].successful++
        agentStats[agent.name].totalProcessingTime += processingTime
        agentStats[agent.name].averageProcessingTime = Math.round(
          agentStats[agent.name].totalProcessingTime /
            agentStats[agent.name].successful,
        )

        agentResults.push({
          agentName: agent.name,
          agentRole: agent.role,
          result: result,
          processingTime: processingTime,
        })
      } catch (error) {
        console.error(`      ❌ ${agent.name} failed: ${error.message}`)
        agentStats[agent.name].failed++

        // Continue with other agents even if one fails
        agentResults.push({
          agentName: agent.name,
          agentRole: agent.role,
          result: null,
          error: error.message,
          processingTime: 0,
        })
      }
    }

    return agentResults
  }

  /**
   * Extract research findings from agent results
   */
  extractResearchFindings(agentResults) {
    const researchAgent = agentResults.find(
      ar => ar.agentName === 'content-research-agent',
    )

    if (!researchAgent || !researchAgent.result) {
      return {
        conducted: false,
        sourcesFound: 0,
        sectionsAdded: 0,
        contentAdded: false,
      }
    }

    const research = researchAgent.result.enhancedMetadata

    return {
      conducted: research.researchConducted || false,
      sourcesFound: research.researchSources || 0,
      sectionsAdded: research.suggestedContent
        ? research.suggestedContent.split('##').length - 1
        : 0,
      contentAdded: Boolean(
        research.suggestedContent &&
          research.suggestedContent.trim().length > 0,
      ),
      bestPracticesFound: research.bestPracticesFindings?.length || 0,
      standardsFound: research.industryStandards?.length || 0,
      authoritativeSourcesFound: research.authoritativeSources?.length || 0,
      researchScore: research.researchScore || 0,
    }
  }

  /**
   * Generate enhanced content with research additions
   */
  generateEnhancedContentWithResearch(
    originalContent,
    enhancedMetadata,
    agentResults,
  ) {
    const matter = require('gray-matter')
    const parsed = matter(originalContent)

    // Clean metadata for YAML compatibility
    const cleanedMetadata = this.cleanMetadataForSimpleYaml(enhancedMetadata)

    // Merge with original frontmatter
    const mergedMetadata = {
      ...parsed.data,
      ...cleanedMetadata,
    }

    // Extract research content from research agent
    let contentWithResearch = parsed.content
    const researchAgent = agentResults.find(
      ar => ar.agentName === 'content-research-agent',
    )

    if (
      researchAgent &&
      researchAgent.result &&
      researchAgent.result.enhancedMetadata.suggestedContent
    ) {
      const researchContent =
        researchAgent.result.enhancedMetadata.suggestedContent

      // Add research content to the end of the document
      if (researchContent.trim().length > 0) {
        console.log(`   📚 Adding research-based content sections`)
        contentWithResearch = parsed.content + researchContent
      }
    }

    return matter.stringify(contentWithResearch, mergedMetadata, {
      noRefs: true,
      flowLevel: -1,
    })
  }

  /**
   * Merge results from all agents into consolidated enhancement
   */
  mergeAgentResults(agentResults, fileInfo) {
    console.log(`   🔄 Merging results from ${agentResults.length} agents...`)

    const mergedMetadata = {}
    const allImprovements = []
    const agentContributions = {}
    const ragScores = []

    // Initialize agent contributions tracking
    agentResults.forEach(({ agentName, agentRole }) => {
      agentContributions[agentName] = {
        role: agentRole,
        keyContributions: [],
        improvementCount: 0,
      }
    })

    // Process results from each agent
    agentResults.forEach(({ agentName, result, error }) => {
      if (error || !result) {
        console.log(`      ⚠️ Skipping ${agentName} due to error`)
        return
      }

      const { enhancedMetadata, improvements } = result

      // Merge metadata from this agent
      if (enhancedMetadata) {
        this.mergeAgentMetadata(
          mergedMetadata,
          enhancedMetadata,
          agentName,
          agentContributions,
        )

        // Collect RAG scores
        if (
          enhancedMetadata.ragScore ||
          enhancedMetadata.seoScore ||
          enhancedMetadata.taxonomyScore ||
          enhancedMetadata.chunkingScore ||
          enhancedMetadata.researchScore
        ) {
          const scores = [
            enhancedMetadata.ragScore,
            enhancedMetadata.seoScore,
            enhancedMetadata.taxonomyScore,
            enhancedMetadata.chunkingScore,
            enhancedMetadata.researchScore,
          ].filter(score => score && score > 0)

          if (scores.length > 0) {
            ragScores.push(...scores)
          }
        }
      }

      // Collect improvements
      if (improvements && Array.isArray(improvements)) {
        allImprovements.push(...improvements)
        agentContributions[agentName].improvementCount = improvements.length
      }
    })

    // Calculate consolidated RAG score
    const consolidatedRagScore =
      ragScores.length > 0
        ? Math.round(
            ragScores.reduce((acc, score) => acc + score, 0) / ragScores.length,
          )
        : 70

    // Identify added fields
    const originalFields = new Set(Object.keys(fileInfo.frontmatter || {}))
    const addedFields = Object.keys(mergedMetadata).filter(
      field => !originalFields.has(field),
    )

    console.log(
      `      ✅ Merged data from ${
        agentResults.filter(ar => !ar.error && ar.result).length
      } agents`,
    )
    console.log(
      `      📊 Consolidated RAG score: ${consolidatedRagScore} (avg of ${ragScores.length} scores)`,
    )

    return {
      enhancedMetadata: {
        ...mergedMetadata,
        ragScore: consolidatedRagScore,
        agentCount: this.agents.length,
        enhanced_by: 'rag-prep-plugin-multi-agent',
        enhanced_at: new Date().toISOString(),
      },
      improvements: allImprovements,
      ragScore: consolidatedRagScore,
      addedFields: addedFields,
      agentContributions: agentContributions,
    }
  }

  /**
   * Merge metadata from a specific agent
   */
  mergeAgentMetadata(
    mergedMetadata,
    agentMetadata,
    agentName,
    agentContributions,
  ) {
    // Merge array fields
    this.mergeArrayFields(
      mergedMetadata,
      agentMetadata,
      agentName,
      agentContributions,
    )

    // Merge scalar fields
    this.mergeScalarFields(
      mergedMetadata,
      agentMetadata,
      agentName,
      agentContributions,
    )

    // Merge research-specific fields
    this.mergeResearchFields(
      mergedMetadata,
      agentMetadata,
      agentName,
      agentContributions,
    )
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
      'tags',
      'keywords',
      'topics',
      'categories',
      'audience',
      'prerequisites',
    ]

    arrayFields.forEach(field => {
      if (agentMetadata[field] && Array.isArray(agentMetadata[field])) {
        if (!mergedMetadata[field]) {
          mergedMetadata[field] = []
        }

        const existingItems = new Set(mergedMetadata[field])
        const newItems = agentMetadata[field].filter(
          item => !existingItems.has(item),
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
   * Merge research-specific fields from research agent
   */
  mergeResearchFields(
    mergedMetadata,
    agentMetadata,
    agentName,
    agentContributions,
  ) {
    if (agentName !== 'content-research-agent') return

    const researchFields = [
      'researchConducted',
      'researchDate',
      'researchSources',
      'contentGaps',
      'recommendedSections',
      'bestPracticesFindings',
      'industryStandards',
      'authoritativeSources',
      'researchScore',
      'tavilyIntegration',
    ]

    researchFields.forEach(field => {
      if (agentMetadata[field] !== undefined) {
        mergedMetadata[field] = agentMetadata[field]
        agentContributions[agentName].keyContributions.push(`${field}: added`)
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
      'difficulty',
      'complexity',
      'contentType',
      'domainArea',
      'primaryTopic',
      'category',
      'ragScore',
      'agentCount',
    ]
    scalarFields.forEach(field => {
      if (metadata[field] !== undefined) {
        if (typeof metadata[field] === 'string') {
          cleaned[field] = metadata[field].replace(/"/g, "'")
        } else {
          cleaned[field] = metadata[field]
        }
      }
    })

    // Add research metadata if available
    if (metadata.researchConducted) {
      cleaned.researchConducted = metadata.researchConducted
      cleaned.researchDate = metadata.researchDate
      cleaned.researchSources = metadata.researchSources
      cleaned.researchScore = metadata.researchScore
      cleaned.tavilyIntegration = metadata.tavilyIntegration
    }

    return cleaned
  }

  /**
   * Generate comprehensive multi-agent summary
   */
  generateMultiAgentSummary(enhancements, errors, agentStats) {
    const totalFiles = enhancements.length + errors.length
    const successfulEnhancements = enhancements.length
    const totalAgentOperations = successfulEnhancements * this.agents.length

    // Calculate research statistics
    const researchStats = enhancements.reduce(
      (acc, enh) => {
        if (enh.researchFindings?.conducted) {
          acc.filesWithResearch++
          acc.totalSources += enh.researchFindings.sourcesFound
          acc.totalSectionsAdded += enh.researchFindings.sectionsAdded
        }
        return acc
      },
      { filesWithResearch: 0, totalSources: 0, totalSectionsAdded: 0 },
    )

    // Calculate average RAG score
    const ragScores = enhancements
      .map(e => e.ragScore)
      .filter(score => score > 0)
    const averageRagScore =
      ragScores.length > 0
        ? Math.round(
            ragScores.reduce((acc, score) => acc + score, 0) / ragScores.length,
          )
        : 0

    // Calculate collaboration effectiveness
    const collaborationEffectiveness =
      totalFiles > 0
        ? Math.round(
            (totalAgentOperations / (totalFiles * this.agents.length)) * 100,
          )
        : 0

    return {
      totalFiles,
      successful: successfulEnhancements,
      errors: errors.length,
      averageRagScore,
      agentCollaborations: totalAgentOperations,
      collaborationEffectiveness,
      agentCount: this.agents.length,
      researchStats,
      topImprovements: this.calculateTopImprovements(enhancements),
      topAddedFields: this.calculateTopAddedFields(enhancements),
    }
  }

  /**
   * Calculate top improvements across all files
   */
  calculateTopImprovements(enhancements) {
    const improvementCounts = {}

    enhancements.forEach(enhancement => {
      enhancement.improvements.forEach(improvement => {
        const type = improvement.split(':')[0] || improvement.substring(0, 30)
        improvementCounts[type] = (improvementCounts[type] || 0) + 1
      })
    })

    return Object.entries(improvementCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }))
  }

  /**
   * Calculate top added fields across all files
   */
  calculateTopAddedFields(enhancements) {
    const fieldCounts = {}

    enhancements.forEach(enhancement => {
      enhancement.addedFields.forEach(field => {
        fieldCounts[field] = (fieldCounts[field] || 0) + 1
      })
    })

    return Object.entries(fieldCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([field, count]) => ({ field, count }))
  }
}

module.exports = EnhanceMetadataTask
