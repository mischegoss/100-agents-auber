// src/plugins/doc-steward/file-processor.js - Handles markdown file operations
const fs = require('fs-extra')
const path = require('path')
const matter = require('gray-matter')

class FileProcessor {
  constructor(options) {
    this.options = options
  }

  /**
   * Discover all markdown files in the docs directory
   */
  async discoverDocs() {
    const docsPath = this.options.docsPath

    try {
      const files = await fs.readdir(docsPath)
      const markdownFiles = files.filter(file => file.endsWith('.md'))

      const docs = []
      for (const filename of markdownFiles) {
        const doc = await this.readDocument(filename)
        docs.push(doc)
      }

      return docs
    } catch (error) {
      console.error(`❌ Failed to discover docs in ${docsPath}:`, error.message)
      throw error
    }
  }

  /**
   * Read and parse a single markdown document
   */
  async readDocument(filename) {
    const filePath = path.join(this.options.docsPath, filename)

    try {
      const fileContent = await fs.readFile(filePath, 'utf8')
      const parsed = matter(fileContent)

      return {
        filename,
        filePath,
        title: parsed.data.title || path.basename(filename, '.md'),
        description: parsed.data.description || '',
        content: parsed.content,
        frontMatter: parsed.data,
        originalFrontMatter: { ...parsed.data }, // Keep original for comparison
        wordCount: this.countWords(parsed.content),
        lastModified: await this.getFileModifiedTime(filePath),
      }
    } catch (error) {
      console.error(`❌ Failed to read document ${filename}:`, error.message)
      throw error
    }
  }

  /**
   * Apply AI enhancements to a document and write it back
   */
  async enhanceDocument(doc, aiSuggestions) {
    try {
      // Apply enhancements to front matter
      const enhancedFrontMatter = this.applyEnhancements(
        doc.frontMatter,
        aiSuggestions,
      )

      // Create enhanced document structure
      const enhancedDoc = {
        ...doc,
        frontMatter: enhancedFrontMatter,
        aiEnhancement: {
          applied: true,
          timestamp: new Date().toISOString(),
          keywordsAdded: aiSuggestions.keywords?.length || 0,
          tagsAdded: aiSuggestions.tags?.length || 0,
          contextUsed: !!aiSuggestions.context,
          reasoning: aiSuggestions.reasoning,
          model: this.options.aiModel,
        },
      }

      // Write enhanced document back to file
      await this.writeDocument(enhancedDoc)

      // Create search-ready document
      const searchDoc = this.createSearchDocument(enhancedDoc)

      return searchDoc
    } catch (error) {
      console.error(
        `❌ Failed to enhance document ${doc.filename}:`,
        error.message,
      )
      throw error
    }
  }

  /**
   * Apply AI suggestions to front matter
   */
  applyEnhancements(frontMatter, suggestions) {
    const enhanced = { ...frontMatter }

    // Handle keywords
    const currentKeywords = Array.isArray(enhanced.keywords)
      ? enhanced.keywords
      : []
    const newKeywords = (suggestions.keywords || []).filter(
      kw =>
        !currentKeywords.some(
          existing => existing.toLowerCase() === kw.toLowerCase(),
        ),
    )
    enhanced.keywords = [...currentKeywords, ...newKeywords]

    // Handle tags
    const currentTags = Array.isArray(enhanced.tags) ? enhanced.tags : []
    const newTags = (suggestions.tags || []).filter(
      tag =>
        !currentTags.some(
          existing => existing.toLowerCase() === tag.toLowerCase(),
        ),
    )
    enhanced.tags = [...currentTags, ...newTags]

    // Add enhancement metadata
    enhanced['ai-enhanced'] = new Date().toISOString()
    enhanced['ai-keywords-added'] = newKeywords.length
    enhanced['ai-tags-added'] = newTags.length

    if (suggestions.context) {
      enhanced['ai-context-sources'] = suggestions.context.sources?.length || 0
    }

    return enhanced
  }

  /**
   * Write enhanced document back to file
   */
  async writeDocument(doc) {
    try {
      const enhancedContent = matter.stringify(doc.content, doc.frontMatter)
      await fs.writeFile(doc.filePath, enhancedContent)
      console.log(`✅ Enhanced: ${doc.filename}`)
    } catch (error) {
      console.error(
        `❌ Failed to write document ${doc.filename}:`,
        error.message,
      )
      throw error
    }
  }

  /**
   * Create search-optimized document structure
   */
  createSearchDocument(doc) {
    const docId = `sample-docs/${path.basename(doc.filename, '.md')}`

    return {
      id: docId,
      title: doc.title,
      description: doc.description,
      permalink: `/docs/${docId}`,
      content: doc.content,
      excerpt: this.createExcerpt(doc.content),
      keywords: doc.frontMatter.keywords || [],
      tags: doc.frontMatter.tags || [],
      filename: doc.filename,
      wordCount: doc.wordCount,
      lastModified: doc.lastModified,
      aiEnhanced: true,
      aiEnhancement: doc.aiEnhancement,
    }
  }

  /**
   * Create excerpt from content
   */
  createExcerpt(content, length = 200) {
    if (!content) return 'No content available'

    // Remove markdown formatting for cleaner excerpt
    const cleanContent = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove inline code
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()

    return (
      cleanContent.substring(0, length) +
      (cleanContent.length > length ? '...' : '')
    )
  }

  /**
   * Count words in content
   */
  countWords(content) {
    if (!content) return 0
    return content.trim().split(/\s+/).length
  }

  /**
   * Get file modification time
   */
  async getFileModifiedTime(filePath) {
    try {
      const stats = await fs.stat(filePath)
      return stats.mtime.toISOString()
    } catch (error) {
      return new Date().toISOString()
    }
  }

  /**
   * Create backup of original files (useful for development)
   */
  async createBackup(docs) {
    const backupDir = path.join(this.options.docsPath, '.backup')
    await fs.ensureDir(backupDir)

    for (const doc of docs) {
      const backupPath = path.join(
        backupDir,
        `${doc.filename}.${Date.now()}.bak`,
      )
      await fs.copy(doc.filePath, backupPath)
    }

    console.log(`💾 Created backup for ${docs.length} files in ${backupDir}`)
  }
}

module.exports = FileProcessor
