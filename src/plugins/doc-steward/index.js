// src/plugins/doc-steward/index.js - Main Plugin Orchestrator
const path = require('path')
const fs = require('fs-extra')

const AIEnhancer = require('./ai-enhancer')
const TavilyCrawler = require('./tavily-crawler')
const SearchIndexer = require('./search-indexer')
const FileProcessor = require('./file-processor')

class DocStewardPlugin {
  constructor(context, options) {
    this.context = context
    this.options = {
      // Default options
      docsPath: 'docs/sample-docs',
      outputPath: 'static/doc-steward-index.json',
      aiModel: 'gemini-2.0-flash',
      enabled: true,
      useTavily: true,
      tavilyMaxResults: 3,
      ...options,
    }

    // Initialize modules
    this.fileProcessor = new FileProcessor(this.options)
    this.tavilyCrawler = new TavilyCrawler(this.options)
    this.aiEnhancer = new AIEnhancer(this.options)
    this.searchIndexer = new SearchIndexer(this.options)
  }

  async loadContent() {
    if (!this.options.enabled) {
      console.log('🔍 Doc Steward: Plugin disabled')
      return null
    }

    console.log('🚀 Doc Steward: Starting AI enhancement pipeline...')

    try {
      // Step 1: Discover and read all docs
      const docs = await this.fileProcessor.discoverDocs()
      console.log(`📚 Found ${docs.length} documents to enhance`)

      // Step 2: Process each document through the enhancement pipeline
      const enhancedDocs = []

      for (const doc of docs) {
        console.log(`\n🔍 Processing: ${doc.filename}`)

        // Step 2a: Crawl related context with Tavily
        let context = null
        if (this.options.useTavily) {
          context = await this.tavilyCrawler.crawlRelatedContext(doc)
        }

        // Step 2b: Generate AI-enhanced keywords using context
        const aiSuggestions = await this.aiEnhancer.generateEnhancements(
          doc,
          context,
        )

        // Step 2c: Apply enhancements to the document
        const enhancedDoc = await this.fileProcessor.enhanceDocument(
          doc,
          aiSuggestions,
        )

        enhancedDocs.push(enhancedDoc)

        // Small delay to be nice to APIs
        await this.delay(500)
      }

      // Step 3: Create optimized search index
      const searchIndex = await this.searchIndexer.createIndex(enhancedDocs)

      // Step 4: Write search index to static files
      await this.searchIndexer.writeIndex(searchIndex)

      // Step 5: Generate enhancement report
      const report = this.generateReport(enhancedDocs)
      console.log('\n📊 ENHANCEMENT COMPLETE:')
      console.log('═'.repeat(50))
      console.log(report)
      console.log('═'.repeat(50))

      return {
        enhancedDocs,
        searchIndex,
        report,
      }
    } catch (error) {
      console.error('❌ Doc Steward: Enhancement pipeline failed:', error)
      throw error
    }
  }

  generateReport(enhancedDocs) {
    let totalKeywords = 0
    let totalTags = 0
    let contextCrawled = 0

    const docReports = enhancedDocs.map(doc => {
      const keywordsAdded = doc.aiEnhancement?.keywordsAdded || 0
      const tagsAdded = doc.aiEnhancement?.tagsAdded || 0
      const hadContext = doc.aiEnhancement?.contextUsed || false

      totalKeywords += keywordsAdded
      totalTags += tagsAdded
      if (hadContext) contextCrawled++

      return `📄 ${
        doc.filename
      }: +${keywordsAdded} keywords, +${tagsAdded} tags${
        hadContext ? ' (with context)' : ''
      }`
    })

    return [
      ...docReports,
      '',
      `🎯 Total: +${totalKeywords} keywords, +${totalTags} tags`,
      `🕷️ Tavily contexts crawled: ${contextCrawled}/${enhancedDocs.length}`,
      `🤖 AI model: ${this.options.aiModel}`,
      `⚡ Search index: ${this.options.outputPath}`,
    ].join('\n')
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export the plugin function (Docusaurus plugin format)
module.exports = function docStewardPlugin(context, options) {
  return {
    name: 'doc-steward-plugin',

    async loadContent() {
      const plugin = new DocStewardPlugin(context, options)
      return await plugin.loadContent()
    },

    async contentLoaded({ content, actions }) {
      if (content) {
        const { enhancedDocs, searchIndex, report } = content
        console.log(`✅ Doc Steward: Enhanced ${enhancedDocs.length} documents`)

        // Could add additional Docusaurus actions here if needed
        // e.g., create additional pages, add routes, etc.
      }
    },
  }
}
