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
                      3. Write improved frontmatter back to the files
                      4. Create backups of original files
                      5. Create GitHub PR with enhancement summary
                      6. Provide summary of enhancements made`

    this.expectedOutput = `A comprehensive report containing:
                         - List of all processed files with their enhancements
                         - Summary of metadata improvements made
                         - RAG effectiveness scores for each document
                         - GitHub PR URL for human review
                         - Any errors or issues encountered during processing`

    this.agent = null // Will be set when task is assigned
    this.verbose = true
  }

  /**
   * Execute the metadata enhancement task
   */
  async execute(context) {
    console.log('\n🎯 [Enhance Metadata Task] Starting metadata enhancement...')

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

      const FrontmatterEnhancerTool = require('../tools/frontmatterEnhancerTool')
      const GitHubPRTool = require('../tools/githubPRTool')

      const enhancerTool = new FrontmatterEnhancerTool()
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
        `📋 [Enhance Metadata Task] Processing ${processedFiles.length} files...`,
      )

      const enhancements = []
      const errors = []

      // Process each file through the keyword extraction agent
      for (const fileInfo of processedFiles) {
        try {
          console.log(`\n🔄 Processing: ${fileInfo.title}`)

          // Read the current file content
          const fs = require('fs-extra')
          const path = require('path')

          // Build full path from the site directory and relative path
          const siteDir = process.cwd() // Current working directory (site root)
          const fullPath = path.join(siteDir, fileInfo.path)
          const content = await fs.readFile(fullPath, 'utf8')

          // Use the agent to analyze and enhance metadata
          const agent = this.agent
          const analysisResult = await agent.analyzeContent(
            fullPath,
            content,
            fileInfo.frontmatter,
          )

          enhancements.push({
            filePath: fullPath,
            originalContent: content,
            enhancedMetadata: analysisResult.enhancedMetadata,
            improvements: analysisResult.improvements,
            ragScore:
              analysisResult.enhancedMetadata.ragScore ||
              analysisResult.enhancedMetadata.rag_score,
          })

          console.log(`✅ Analysis complete for: ${fileInfo.title}`)
          console.log(
            `   Improvements: ${analysisResult.improvements.join(', ')}`,
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

      // Apply all enhancements to files
      console.log(
        `\n📝 Writing enhancements to ${enhancements.length} files...`,
      )
      const enhancementResults = await enhancerTool.enhanceFiles(enhancements)

      // Generate comprehensive summary
      const summary = this.generateTaskSummary(
        enhancements,
        enhancementResults,
        errors,
      )

      console.log('\n📊 Enhancement Summary:')
      console.log(`   Files processed: ${summary.totalFiles}`)
      console.log(`   Successfully enhanced: ${summary.successful}`)
      console.log(`   Errors: ${summary.errors}`)
      console.log(`   Average RAG score: ${summary.averageRagScore}`)

      // Create GitHub PR if we have successful enhancements
      if (
        enhancementResults.length > 0 &&
        enhancementResults.some(r => r.success)
      ) {
        console.log('\n🔀 [Enhance Metadata Task] Creating GitHub PR...')

        try {
          const prResult = await githubTool.createEnhancementPR(
            enhancementResults,
            summary,
          )

          if (prResult.success) {
            console.log(
              `✅ [Enhance Metadata Task] PR created: ${prResult.prUrl}`,
            )
            summary.githubPR = {
              url: prResult.prUrl,
              number: prResult.prNumber,
              branch: prResult.branch,
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
        console.log(
          '\n⏭️ [Enhance Metadata Task] Skipping PR creation - no successful enhancements',
        )
      }

      return {
        success: true,
        summary,
        enhancements: enhancementResults,
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
   * Generate comprehensive task summary
   */
  generateTaskSummary(enhancements, enhancementResults, errors) {
    const successful = enhancementResults.filter(r => r.success)
    const ragScores = enhancements.filter(e => e.ragScore).map(e => e.ragScore)

    const averageRagScore =
      ragScores.length > 0
        ? Math.round(ragScores.reduce((a, b) => a + b, 0) / ragScores.length)
        : 0

    // Count improvement types
    const improvementTypes = {}
    enhancements.forEach(enhancement => {
      enhancement.improvements.forEach(improvement => {
        improvementTypes[improvement] = (improvementTypes[improvement] || 0) + 1
      })
    })

    // Count added fields across all successful enhancements
    const addedFieldTypes = {}
    successful.forEach(result => {
      if (result.addedFields) {
        result.addedFields.forEach(field => {
          addedFieldTypes[field] = (addedFieldTypes[field] || 0) + 1
        })
      }
    })

    return {
      totalFiles: enhancements.length,
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
      enhancementDetails: successful.map(result => ({
        file: result.filePath.split('/').pop(),
        addedFields: result.addedFields || [],
        success: result.success,
      })),
    }
  }

  /**
   * Generate human-readable summary for console output
   */
  logEnhancementSummary(summary) {
    console.log('\n📈 DETAILED ENHANCEMENT SUMMARY:')
    console.log('=====================================')

    if (summary.githubPR) {
      console.log(`🔗 GitHub PR: ${summary.githubPR.url}`)
      console.log(`📝 PR Number: #${summary.githubPR.number}`)
      console.log(`🌿 Branch: ${summary.githubPR.branch}`)
      console.log('')
    }

    console.log(`📁 Total files processed: ${summary.totalFiles}`)
    console.log(`✅ Successfully enhanced: ${summary.successful}`)
    console.log(`❌ Errors encountered: ${summary.errors}`)
    console.log(`🎯 Average RAG score: ${summary.averageRagScore}/100`)

    if (summary.ragScores) {
      console.log(
        `📊 RAG score range: ${summary.ragScores.min} - ${summary.ragScores.max}`,
      )
    }

    if (summary.topAddedFields && summary.topAddedFields.length > 0) {
      console.log('\n🏷️ MOST COMMON FIELD ADDITIONS:')
      summary.topAddedFields.forEach((field, index) => {
        console.log(`   ${index + 1}. ${field.field}: ${field.count} files`)
      })
    }

    if (summary.topImprovements && summary.topImprovements.length > 0) {
      console.log('\n🔧 TOP IMPROVEMENT TYPES:')
      summary.topImprovements.forEach((improvement, index) => {
        console.log(
          `   ${index + 1}. ${improvement.type}: ${improvement.count} files`,
        )
      })
    }

    console.log('\n🎉 Metadata enhancement task completed!')

    if (summary.githubPR) {
      console.log(`\n👀 Review your changes: ${summary.githubPR.url}`)
    }
  }
}

module.exports = EnhanceMetadataTask
