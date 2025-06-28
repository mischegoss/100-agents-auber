/**
 * RAG Prep Plugin with Interactive Prompt
 * Asks user if they want to run AI enhancement to avoid wasting resources during development
 */

const readline = require('readline')

async function promptUser(question, defaultAnswer = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve => {
    const defaultText = defaultAnswer ? ' (Y/n)' : ' (y/N)'
    rl.question(`${question}${defaultText}: `, answer => {
      rl.close()

      const normalizedAnswer = answer.toLowerCase().trim()

      if (defaultAnswer) {
        // Default is Yes, so only No/n will return false
        resolve(normalizedAnswer !== 'n' && normalizedAnswer !== 'no')
      } else {
        // Default is No, so only Yes/y will return true
        resolve(normalizedAnswer === 'y' || normalizedAnswer === 'yes')
      }
    })
  })
}

async function ragPrepPlugin(context, options) {
  return {
    name: 'rag-prep-plugin',

    async loadContent() {
      // Check if we're in development mode and should prompt
      const isDev =
        process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
      const isProduction = process.env.NODE_ENV === 'production'

      // Skip prompt in production or if RAG_SKIP_PROMPT env var is set
      if (isProduction || process.env.RAG_SKIP_PROMPT === 'true') {
        console.log('🚀 RAG Prep Plugin starting (production mode)...')
        return await this.runRAGProcessing()
      }

      // In development, prompt the user
      if (isDev) {
        console.log('\n📋 RAG Documentation Enhancement Plugin')
        console.log(
          '💡 This will run AI agents to analyze and enhance documentation',
        )
        console.log(
          '⚡ Tip: Set RAG_SKIP_PROMPT=true in .env.local to always skip this prompt',
        )

        const shouldRun = await promptUser(
          '🤖 Do you want to run RAG documentation enhancement?',
          false, // Default to No for development
        )

        if (shouldRun) {
          console.log('✅ Starting RAG enhancement workflow...')
          return await this.runRAGProcessing()
        } else {
          console.log('⏭️  Skipping RAG enhancement (faster startup)')
          console.log(
            '💡 You can run it later by restarting with "y" when prompted',
          )
          return null
        }
      }

      // Fallback - run the processing
      return await this.runRAGProcessing()
    },

    async runRAGProcessing() {
      try {
        // Import your existing RAG processing logic
        const DocumentProcessingTeam = require('./teams/documentProcessingTeam')
        const EnhanceMetadataTask = require('./tasks/enhanceMetadataTask')
        const fs = require('fs-extra')
        const path = require('path')

        console.log('🚀 RAG Prep Plugin initialized')
        console.log('📁 Site directory:', process.cwd())

        const siteDir = process.cwd()
        const docsDir = path.join(siteDir, 'docs-enhanced/sample-docs')
        console.log('📄 Target docs directory:', docsDir)

        // Discover and analyze documents
        console.log('\n🔍 Starting document discovery...')
        const processedFiles = await this.discoverDocuments(docsDir)

        if (processedFiles.length === 0) {
          console.log('ℹ️ No documents found to process')
          return null
        }

        // Run the multi-agent workflow
        const documentTeam = new DocumentProcessingTeam()
        const result = await documentTeam.processDocuments(processedFiles)

        return result
      } catch (error) {
        console.error('❌ RAG Plugin Error:', error.message)
        console.log('💡 Continuing with normal Docusaurus startup...')
        return null
      }
    },

    async discoverDocuments(docsDir) {
      const fs = require('fs-extra')
      const path = require('path')
      const matter = require('gray-matter')

      try {
        // Find all markdown files
        const files = await fs.readdir(docsDir)
        const markdownFiles = files.filter(
          file => file.endsWith('.md') && !file.includes('.backup'),
        )

        console.log('📚 Found', markdownFiles.length, 'markdown files:')
        markdownFiles.forEach((file, index) => {
          console.log(
            `  ${index + 1}. ${docsDir.replace(process.cwd(), '')}/${file}`,
          )
        })

        const processedFiles = []

        console.log('\n📊 Analyzing documents...')
        for (const file of markdownFiles) {
          const filePath = path.join(docsDir, file)
          const relativePath = path.relative(process.cwd(), filePath)

          try {
            const content = await fs.readFile(filePath, 'utf8')
            const parsed = matter(content)
            const wordCount = parsed.content.split(/\s+/).length
            const headingCount = (parsed.content.match(/^#+\s+/gm) || []).length

            // Check if recently enhanced (within 24 hours)
            const lastEnhanced =
              parsed.data.enhanced_at || parsed.data['ai-enhanced']
            const isRecentlyEnhanced =
              lastEnhanced &&
              Date.now() - new Date(lastEnhanced).getTime() <
                24 * 60 * 60 * 1000

            const fileInfo = {
              path: relativePath,
              title: parsed.data.title || 'Untitled',
              wordCount,
              headingCount,
              frontmatter: parsed.data,
              needsEnhancement: !isRecentlyEnhanced,
            }

            console.log(`📄 ${fileInfo.title}`)
            console.log(`   Path: ${relativePath}`)
            console.log(`   Words: ${wordCount} | Headings: ${headingCount}`)
            console.log(
              `   Status: ${
                isRecentlyEnhanced
                  ? '✅ Recently enhanced'
                  : '🔄 Needs enhancement'
              }`,
            )

            processedFiles.push(fileInfo)
          } catch (error) {
            console.error(`❌ Error processing ${file}:`, error.message)
          }
        }

        console.log(
          '\n✅ Initial analysis complete! Processed',
          processedFiles.length,
          'files',
        )

        // Summary
        const needEnhancement = processedFiles.filter(
          f => f.needsEnhancement,
        ).length
        const recentlyEnhanced = processedFiles.length - needEnhancement

        console.log('\n📊 ENHANCEMENT EFFICIENCY SUMMARY:')
        console.log(`   📁 Total files: ${processedFiles.length}`)
        console.log(`   🔄 Need enhancement: ${needEnhancement}`)
        console.log(`   ✅ Recently enhanced (skip): ${recentlyEnhanced}`)

        return processedFiles
      } catch (error) {
        console.error('❌ Error discovering documents:', error.message)
        return []
      }
    },

    // Docusaurus plugin methods
    async contentLoaded({ content, actions }) {
      if (content) {
        console.log('📋 Content loaded into Docusaurus build process')
      }
    },
  }
}

module.exports = ragPrepPlugin
