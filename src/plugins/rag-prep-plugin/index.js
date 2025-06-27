const path = require('path')
const fs = require('fs-extra')
const matter = require('gray-matter')

/**
 * Docusaurus RAG Prep Plugin
 * Enhances documentation for RAG effectiveness using KaibanJS agents
 */
class RagPrepPlugin {
  constructor(context, options) {
    this.context = context
    this.options = options
    this.siteDir = context.siteDir
    this.docsDir = path.join(this.siteDir, 'docs-enhanced', 'sample-docs')
    this.processedFiles = []

    console.log('🚀 RAG Prep Plugin initialized')
    console.log(`📁 Site directory: ${this.siteDir}`)
    console.log(`📄 Target docs directory: ${this.docsDir}`)
  }

  /**
   * Main plugin entry point for Docusaurus
   */
  async loadContent() {
    console.log('\n🔍 Starting document discovery...')

    try {
      // Find all markdown files in docs directory
      const markdownFiles = await this.findMarkdownFiles(this.docsDir)
      console.log(`📚 Found ${markdownFiles.length} markdown files:`)

      markdownFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${path.relative(this.siteDir, file)}`)
      })

      // Process each file and show basic analysis
      console.log('\n📊 Analyzing documents...')
      for (const filePath of markdownFiles) {
        await this.analyzeDocument(filePath)
      }

      console.log(
        `\n✅ Initial analysis complete! Processed ${this.processedFiles.length} files`,
      )

      // Run AI agent processing
      const agentResult = await this.runAgentProcessing()

      return {
        processedFiles: this.processedFiles,
        totalFiles: markdownFiles.length,
        agentProcessing: agentResult,
      }
    } catch (error) {
      console.error('❌ Error during document processing:', error)
      throw error
    }
  }

  /**
   * Recursively find all markdown files
   */
  async findMarkdownFiles(dir) {
    const files = []

    if (!(await fs.pathExists(dir))) {
      console.warn(`⚠️  Directory not found: ${dir}`)
      return files
    }

    const items = await fs.readdir(dir)

    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stat = await fs.stat(itemPath)

      if (stat.isDirectory()) {
        // Recursively search subdirectories
        const subFiles = await this.findMarkdownFiles(itemPath)
        files.push(...subFiles)
      } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
        files.push(itemPath)
      }
    }

    return files
  }

  /**
   * Analyze a single document and show immediate feedback
   */
  async analyzeDocument(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      const parsed = matter(content)
      const relativePath = path.relative(this.siteDir, filePath)

      // Basic document analysis
      const analysis = {
        path: relativePath,
        title: parsed.data.title || 'Untitled',
        wordCount: parsed.content.split(/\s+/).length,
        headingCount: (parsed.content.match(/^#+\s/gm) || []).length,
        hasMetadata: Object.keys(parsed.data).length > 0,
        frontmatter: parsed.data,
        contentPreview: parsed.content.substring(0, 100) + '...',
      }

      // Show immediate feedback
      console.log(`\n📄 ${analysis.title}`)
      console.log(`   Path: ${analysis.path}`)
      console.log(
        `   Words: ${analysis.wordCount} | Headings: ${analysis.headingCount}`,
      )
      console.log(`   Has metadata: ${analysis.hasMetadata ? '✅' : '❌'}`)

      // Identify potential issues for RAG optimization
      const issues = this.identifyBasicIssues(analysis)
      if (issues.length > 0) {
        console.log(`   🔧 Potential improvements: ${issues.join(', ')}`)
      }

      this.processedFiles.push(analysis)
    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}:`, error.message)
    }
  }

  /**
   * Identify basic issues that agents can fix
   */
  identifyBasicIssues(analysis) {
    const issues = []

    if (!analysis.hasMetadata) {
      issues.push('Missing metadata')
    }

    if (analysis.wordCount < 50) {
      issues.push('Very short content')
    }

    if (analysis.headingCount === 0) {
      issues.push('No headings')
    }

    if (!analysis.frontmatter.description) {
      issues.push('No description')
    }

    if (!analysis.frontmatter.tags) {
      issues.push('No tags')
    }

    return issues
  }

  /**
   * Run AI agent processing on documents
   */
  async runAgentProcessing() {
    console.log('\n🤖 Starting AI agent processing...')

    try {
      // Debug: Check if processedFiles exists
      console.log(
        `🔍 [Debug] processedFiles length: ${
          this.processedFiles?.length || 'undefined'
        }`,
      )

      if (!this.processedFiles || this.processedFiles.length === 0) {
        console.error('❌ No processed files available for agent processing')
        return {
          success: false,
          error: 'No processed files available',
          summary: null,
        }
      }

      // Import and initialize the Document Processing Team
      const DocumentProcessingTeam = require('./teams/documentProcessingTeam')
      const team = new DocumentProcessingTeam()

      // Process documents through the AI team
      const result = await team.processDocuments(this.processedFiles)

      if (result.success) {
        console.log('🎉 AI processing completed successfully!')
        return result
      } else {
        console.error('❌ AI processing failed:', result.error)
        return result
      }
    } catch (error) {
      console.error('❌ Error in AI agent processing:', error.message)
      console.error('❌ Stack trace:', error.stack)
      return {
        success: false,
        error: error.message,
        summary: null,
      }
    }
  }
}

/**
 * Docusaurus plugin factory function
 */
function ragPrepPlugin(context, options = {}) {
  const plugin = new RagPrepPlugin(context, options)

  return {
    name: 'rag-prep-plugin',

    async loadContent() {
      return await plugin.loadContent()
    },

    async contentLoaded({ content, actions }) {
      // This is where processed content gets integrated back into Docusaurus
      console.log('📋 Content loaded into Docusaurus build process')

      // Future: Create pages showing analytics, before/after comparisons
      const { createData } = actions
      await createData('rag-analysis.json', JSON.stringify(content, null, 2))
    },

    getPathsToWatch() {
      // Watch for changes in docs-enhanced/sample-docs directory
      return [
        path.join(context.siteDir, 'docs-enhanced/sample-docs/**/*.{md,mdx}'),
      ]
    },
  }
}

module.exports = ragPrepPlugin
