/**
 * Enhance Metadata Task
 * Coordinates keyword extraction and frontmatter enhancement with GitHub PR creation
 * Note: Using simple class instead of extending KaibanJS Task to avoid constructor issues
 */
class EnhanceMetadataTask {
  constructor() {
    this.description = `Analyze document content using AI to extract keywords, generate descriptions, 
                      and enhance frontmatter metadata for improved RAG effectiveness and searchability.
                      
                      This task will:
                      1. Analyze each document's content and structure
                      2. Generate enhanced metadata using Google Gemini AI
                      3. Create GitHub PR with proposed enhancements (NO immediate file writing)
                      4. Wait for human approval before applying changes
                      5. Provide summary of proposed enhancements`

    this.expectedOutput = `A comprehensive report containing:
                         - List of all processed files with their proposed enhancements
                         - Summary of metadata improvements to be made
                         - RAG effectiveness scores for each document
                         - GitHub PR URL for human review and approval
                         - Any errors or issues encountered during processing`

    this.agent = null // Will be set when task is assigned
    this.verbose = true
  }

  /**
   * Execute the metadata enhancement task
   */
  async execute(context) {
    console.log(
      '\n🎯 [Enhance Metadata Task] Starting metadata enhancement analysis...',
    )

    try {
      const { processedFiles } = context

      // Debug: Check context
      console.log(`🔍 [Debug Task] Context keys: ${Object.keys(context)}`)
      console.log(
        `🔍 [Debug Task] processedFiles type: ${typeof processedFiles}`,
      )
      console.log(
        `🔍 [Debug Task] processedFiles length: ${
          processedFiles?.length || 'undefined'
        }`,
      )

      const GitHubPRTool = require('../tools/githubPRTool')
      const githubTool = new GitHubPRTool()

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

      console.log(
        `📋 [Enhance Metadata Task] Analyzing ${processedFiles.length} files...`,
      )

      const proposedEnhancements = []
      const errors = []

      // Process each file through the keyword extraction agent (IN MEMORY ONLY)
      for (const fileInfo of processedFiles) {
        try {
          console.log(`\n🔄 Analyzing: ${fileInfo.title}`)

          // Read the current file content
          const fs = require('fs-extra')
          const path = require('path')

          // Build full path from the site directory and relative path
          const siteDir = process.cwd() // Current working directory (site root)
          const fullPath = path.join(siteDir, fileInfo.path)
          const originalContent = await fs.readFile(fullPath, 'utf8')

          // Use the agent to analyze and enhance metadata
          const agent = this.agent
          const analysisResult = await agent.analyzeContent(
            fullPath,
            originalContent,
            fileInfo.frontmatter,
          )

          // Generate enhanced content in memory (don't write to disk yet)
          const enhancedContent = this.generateEnhancedContent(
            originalContent,
            analysisResult.enhancedMetadata,
          )

          proposedEnhancements.push({
            filePath: fullPath,
            relativePath: fileInfo.path,
            originalContent: originalContent,
            enhancedContent: enhancedContent,
            enhancedMetadata: analysisResult.enhancedMetadata,
            improvements: analysisResult.improvements,
            ragScore:
              analysisResult.enhancedMetadata.ragScore ||
              analysisResult.enhancedMetadata.rag_score,
            addedFields: this.getAddedFields(
              fileInfo.frontmatter,
              analysisResult.enhancedMetadata,
            ),
          })

          console.log(`✅ Analysis complete for: ${fileInfo.title}`)
          console.log(
            `   Proposed improvements: ${analysisResult.improvements.join(
              ', ',
            )}`,
          )
          console.log(
            `   New fields to add: ${this.getAddedFields(
              fileInfo.frontmatter,
              analysisResult.enhancedMetadata,
            ).join(', ')}`,
          )
        } catch (error) {
          console.error(`❌ Error analyzing ${fileInfo.title}:`, error.message)
          errors.push({
            file: fileInfo.title,
            path: fileInfo.path,
            error: error.message,
          })
        }
      }

      // Generate comprehensive summary
      const summary = this.generateTaskSummary(proposedEnhancements, errors)

      console.log('\n📊 Enhancement Analysis Summary:')
      console.log(`   Files analyzed: ${summary.totalFiles}`)
      console.log(`   Successful analyses: ${summary.successful}`)
      console.log(`   Errors: ${summary.errors}`)
      console.log(`   Average RAG score: ${summary.averageRagScore}`)

      // Create GitHub PR with proposed changes (NO file writing)
      if (proposedEnhancements.length > 0) {
        console.log(
          '\n🔀 [Enhance Metadata Task] Creating GitHub PR with proposed changes...',
        )
        console.log(
          '📝 [Note] Files will NOT be modified until PR is approved and merged',
        )

        try {
          const prResult = await githubTool.createEnhancementPR(
            proposedEnhancements,
            summary,
          )

          if (prResult.success) {
            console.log(
              `✅ [Enhance Metadata Task] PR created: ${prResult.prUrl}`,
            )
            console.log(
              `📋 [Next Steps] Review and approve PR to apply changes`,
            )
            summary.githubPR = {
              url: prResult.prUrl,
              number: prResult.prNumber,
              branch: prResult.branch,
              status: 'pending_review',
            }
          } else {
            console.error(
              `❌ [Enhance Metadata Task] PR creation failed: ${prResult.error}`,
            )
            errors.push({
              file: 'GitHub PR Creation',
              error: prResult.error,
            })
          }
        } catch (prError) {
          console.error(`❌ [Enhance Metadata Task] PR error:`, prError.message)
          errors.push({
            file: 'GitHub PR Creation',
            error: prError.message,
          })
        }
      } else {
        console.log('\n⏭️ [Enhance Metadata Task] No enhancements to propose')
      }

      return {
        success: true,
        summary,
        proposedEnhancements,
        errors,
      }
    } catch (error) {
      console.error('❌ [Enhance Metadata Task] Fatal error:', error.message)
      console.error('❌ [Enhance Metadata Task] Stack trace:', error.stack)
      return {
        success: false,
        error: error.message,
        summary: null,
      }
    }
  }

  /**
   * Generate enhanced content with new frontmatter (in memory only)
   */
  generateEnhancedContent(originalContent, enhancedMetadata) {
    const matter = require('gray-matter')

    // Parse the original file
    const parsed = matter(originalContent)

    // Clean and simplify the enhanced metadata for maximum YAML compatibility
    const cleanedMetadata = this.cleanMetadataForSimpleYaml(enhancedMetadata)

    // Merge original metadata with enhancements (enhanced takes precedence)
    const mergedMetadata = {
      ...parsed.data,
      ...cleanedMetadata,
      // Add processing metadata
      enhanced_by: 'rag-prep-plugin',
      enhanced_at: new Date().toISOString(),
      original_title: parsed.data.title || 'Untitled',
    }

    // Reconstruct the file with enhanced frontmatter using clean YAML
    const enhancedContent = matter.stringify(parsed.content, mergedMetadata, {
      // Force simple YAML output - no references, no complex syntax
      noRefs: true,
      flowLevel: -1,
    })

    return enhancedContent
  }

  /**
   * Clean metadata to ensure simple, compatible YAML output
   */
  cleanMetadataForSimpleYaml(enhancedMetadata) {
    const cleaned = {}

    // Clean description - ensure it's a simple string
    if (enhancedMetadata.description) {
      cleaned.description = enhancedMetadata.description
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/"/g, "'") // Replace quotes to avoid YAML escaping issues
    }

    // Clean arrays - ensure they're simple string arrays
    ;['tags', 'keywords', 'topics', 'related'].forEach(field => {
      if (enhancedMetadata[field] && Array.isArray(enhancedMetadata[field])) {
        cleaned[field] = enhancedMetadata[field]
          .filter(item => item && typeof item === 'string' && item.trim())
          .map(item => item.trim().replace(/"/g, "'"))
          .slice(0, 10) // Limit array size

        // Ensure at least one value for critical fields
        if (
          (field === 'tags' || field === 'keywords') &&
          cleaned[field].length === 0
        ) {
          cleaned[field] = ['documentation']
        }
      }
    })

    // Clean improvements array - ensure simple strings
    if (
      enhancedMetadata.rag_improvements &&
      Array.isArray(enhancedMetadata.rag_improvements)
    ) {
      cleaned.ragImprovements = enhancedMetadata.rag_improvements
        .filter(item => item && typeof item === 'string')
        .map(item =>
          item
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/"/g, "'"),
        )
        .slice(0, 5) // Limit to 5 improvements
    } else if (
      enhancedMetadata.ragImprovements &&
      Array.isArray(enhancedMetadata.ragImprovements)
    ) {
      cleaned.ragImprovements = enhancedMetadata.ragImprovements
        .filter(item => item && typeof item === 'string')
        .map(item =>
          item
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/"/g, "'"),
        )
        .slice(0, 5)
    }

    // Simple scalar values - avoid any complex types
    if (
      enhancedMetadata.category &&
      typeof enhancedMetadata.category === 'string'
    ) {
      cleaned.category = enhancedMetadata.category.trim()
    }

    if (
      enhancedMetadata.difficulty &&
      typeof enhancedMetadata.difficulty === 'string'
    ) {
      cleaned.difficulty = enhancedMetadata.difficulty.trim()
    }

    // Use ONLY camelCase for scores - avoid duplicates
    if (typeof enhancedMetadata.ragScore === 'number') {
      cleaned.ragScore = enhancedMetadata.ragScore
    } else if (typeof enhancedMetadata.rag_score === 'number') {
      cleaned.ragScore = enhancedMetadata.rag_score
    }

    // Ensure title is clean
    if (enhancedMetadata.title && typeof enhancedMetadata.title === 'string') {
      cleaned.title = enhancedMetadata.title.trim()
    }

    return cleaned
  }

  /**
   * Get fields that would be added by enhancement
   */
  getAddedFields(originalFrontmatter, enhancedMetadata) {
    const original = originalFrontmatter || {}
    const enhanced = this.cleanMetadataForSimpleYaml(enhancedMetadata)

    return Object.keys(enhanced).filter(key => !original[key])
  }

  /**
   * Generate comprehensive task summary
   */
  generateTaskSummary(proposedEnhancements, errors) {
    const successful = proposedEnhancements.filter(e => e.enhancedMetadata)
    const ragScores = proposedEnhancements
      .filter(e => e.ragScore)
      .map(e => e.ragScore)

    const averageRagScore =
      ragScores.length > 0
        ? Math.round(ragScores.reduce((a, b) => a + b, 0) / ragScores.length)
        : 0

    // Count improvement types
    const improvementTypes = {}
    proposedEnhancements.forEach(enhancement => {
      enhancement.improvements.forEach(improvement => {
        improvementTypes[improvement] = (improvementTypes[improvement] || 0) + 1
      })
    })

    // Count added fields across all proposed enhancements
    const addedFieldTypes = {}
    proposedEnhancements.forEach(enhancement => {
      if (enhancement.addedFields) {
        enhancement.addedFields.forEach(field => {
          addedFieldTypes[field] = (addedFieldTypes[field] || 0) + 1
        })
      }
    })

    return {
      totalFiles: proposedEnhancements.length,
      successful: successful.length,
      errors: errors.length,
      averageRagScore,
      ragScores:
        ragScores.length > 0
          ? {
              min: Math.min(...ragScores),
              max: Math.max(...ragScores),
              average: averageRagScore,
            }
          : null,
      improvementTypes,
      addedFieldTypes,
      topImprovements: Object.entries(improvementTypes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({ type, count })),
      topAddedFields: Object.entries(addedFieldTypes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([field, count]) => ({ field, count })),
      proposedChanges: successful.map(enhancement => ({
        file: enhancement.filePath.split('/').pop(),
        addedFields: enhancement.addedFields || [],
        ragScore: enhancement.ragScore,
      })),
    }
  }
}

module.exports = EnhanceMetadataTask
