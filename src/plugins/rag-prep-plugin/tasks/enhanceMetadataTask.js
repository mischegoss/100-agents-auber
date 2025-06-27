/**
 * Enhance Metadata Task
 * Coordinates keyword extraction and frontmatter enhancement
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
                      5. Provide summary of enhancements made`

    this.expectedOutput = `A comprehensive report containing:
                         - List of all processed files with their enhancements
                         - Summary of metadata improvements made
                         - RAG effectiveness scores for each document
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
      const enhancerTool = new FrontmatterEnhancerTool()

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
            ragScore: analysisResult.enhancedMetadata.rag_score,
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

    return {
      totalFiles: enhancements.length,
      successful: successful.length,
      errors: errors.length,
      averageRagScore,
      ragScores: {
        min: Math.min(...ragScores),
        max: Math.max(...ragScores),
        average: averageRagScore,
      },
      improvementTypes,
      topImprovements: Object.entries(improvementTypes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([type, count]) => ({ type, count })),
      enhancementDetails: successful.map(result => ({
        file: result.filePath.split('/').pop(),
        addedFields: result.addedFields,
      })),
    }
  }
}

module.exports = EnhanceMetadataTask
