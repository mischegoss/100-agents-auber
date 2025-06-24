// src/plugins/doc-steward/search-indexer.js - Creates optimized search index
const fs = require('fs-extra')
const path = require('path')

class SearchIndexer {
  constructor(options) {
    this.options = options
  }

  /**
   * Create optimized search index from enhanced documents
   */
  async createIndex(enhancedDocs) {
    console.log('🔍 Creating optimized search index...')

    try {
      // Create main search index
      const searchIndex = {
        meta: {
          generated: new Date().toISOString(),
          version: '1.0.0',
          totalDocs: enhancedDocs.length,
          aiEnhanced: enhancedDocs.filter(doc => doc.aiEnhanced).length,
          generator: 'doc-steward-plugin',
          model: this.options.aiModel,
        },

        // Main searchable documents
        docs: enhancedDocs.map(doc => this.createSearchableDoc(doc)),

        // Optimized keyword index for fast lookups
        keywordIndex: this.createKeywordIndex(enhancedDocs),

        // Tag index for category-based search
        tagIndex: this.createTagIndex(enhancedDocs),

        // Statistics for analytics
        stats: this.createIndexStats(enhancedDocs),
      }

      console.log(
        `📊 Created search index with ${searchIndex.docs.length} documents`,
      )
      console.log(
        `🎯 Keyword index: ${
          Object.keys(searchIndex.keywordIndex).length
        } unique terms`,
      )
      console.log(
        `🏷️ Tag index: ${Object.keys(searchIndex.tagIndex).length} unique tags`,
      )

      return searchIndex
    } catch (error) {
      console.error('❌ Failed to create search index:', error)
      throw error
    }
  }

  /**
   * Create searchable document structure
   */
  createSearchableDoc(doc) {
    return {
      id: doc.id,
      title: doc.title,
      description: doc.description,
      permalink: doc.permalink,
      excerpt: doc.excerpt,

      // Enhanced search metadata
      keywords: doc.keywords || [],
      tags: doc.tags || [],

      // Content for full-text search
      content: this.prepareContentForSearch(doc.content),

      // Search optimization data
      searchWeight: this.calculateSearchWeight(doc),

      // Metadata for display
      wordCount: doc.wordCount,
      lastModified: doc.lastModified,
      filename: doc.filename,

      // AI enhancement info
      aiEnhanced: doc.aiEnhanced || false,
      aiEnhancement: doc.aiEnhancement || null,
    }
  }

  /**
   * Prepare content for search (clean and optimize)
   */
  prepareContentForSearch(content) {
    if (!content) return ''

    // Remove markdown formatting but keep text content
    return content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`([^`]+)`/g, '$1') // Remove inline code formatting
      .replace(/#{1,6}\s+/g, '') // Remove headers markers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/>\s+/g, '') // Remove blockquotes
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  /**
   * Calculate search weight for document ranking
   */
  calculateSearchWeight(doc) {
    let weight = 1.0

    // Boost documents with more keywords (AI-enhanced)
    if (doc.keywords && doc.keywords.length > 0) {
      weight += doc.keywords.length * 0.1
    }

    // Boost documents with tags
    if (doc.tags && doc.tags.length > 0) {
      weight += doc.tags.length * 0.05
    }

    // Boost AI-enhanced documents
    if (doc.aiEnhanced) {
      weight += 0.3
    }

    // Boost based on content length (longer docs get slight boost)
    if (doc.wordCount) {
      weight += Math.min(doc.wordCount / 1000, 0.5)
    }

    // Boost recently modified documents
    if (doc.lastModified) {
      const daysSinceModified =
        (Date.now() - new Date(doc.lastModified)) / (1000 * 60 * 60 * 24)
      if (daysSinceModified < 30) {
        weight += 0.2
      }
    }

    return Math.round(weight * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Create keyword index for fast lookups
   */
  createKeywordIndex(docs) {
    const keywordIndex = {}

    docs.forEach(doc => {
      // Index all keywords
      ;(doc.keywords || []).forEach(keyword => {
        const key = keyword.toLowerCase()
        if (!keywordIndex[key]) {
          keywordIndex[key] = []
        }
        keywordIndex[key].push({
          docId: doc.id,
          type: 'keyword',
          weight: 1.0,
        })
      })

      // Index title words
      if (doc.title) {
        doc.title
          .toLowerCase()
          .split(/\s+/)
          .forEach(word => {
            if (word.length > 2) {
              if (!keywordIndex[word]) {
                keywordIndex[word] = []
              }
              keywordIndex[word].push({
                docId: doc.id,
                type: 'title',
                weight: 0.9,
              })
            }
          })
      }

      // Index content words (sample for performance)
      if (doc.content) {
        const contentWords = doc.content
          .toLowerCase()
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 3)
          .slice(0, 50) // Limit for performance

        const uniqueWords = [...new Set(contentWords)]
        uniqueWords.forEach(word => {
          if (!keywordIndex[word]) {
            keywordIndex[word] = []
          }
          keywordIndex[word].push({
            docId: doc.id,
            type: 'content',
            weight: 0.3,
          })
        })
      }
    })

    return keywordIndex
  }

  /**
   * Create tag index for category-based search
   */
  createTagIndex(docs) {
    const tagIndex = {}

    docs.forEach(doc => {
      ;(doc.tags || []).forEach(tag => {
        const key = tag.toLowerCase()
        if (!tagIndex[key]) {
          tagIndex[key] = {
            displayName: tag,
            docs: [],
          }
        }
        tagIndex[key].docs.push({
          docId: doc.id,
          title: doc.title,
          excerpt: doc.excerpt,
        })
      })
    })

    return tagIndex
  }

  /**
   * Create index statistics for analytics
   */
  createIndexStats(docs) {
    const totalKeywords = docs.reduce(
      (sum, doc) => sum + (doc.keywords?.length || 0),
      0,
    )
    const totalTags = docs.reduce(
      (sum, doc) => sum + (doc.tags?.length || 0),
      0,
    )
    const aiEnhancedCount = docs.filter(doc => doc.aiEnhanced).length

    const keywordDistribution = {}
    const tagDistribution = {}

    docs.forEach(doc => {
      ;(doc.keywords || []).forEach(keyword => {
        keywordDistribution[keyword] = (keywordDistribution[keyword] || 0) + 1
      })
      ;(doc.tags || []).forEach(tag => {
        tagDistribution[tag] = (tagDistribution[tag] || 0) + 1
      })
    })

    return {
      totalDocs: docs.length,
      aiEnhancedDocs: aiEnhancedCount,
      enhancementRate: Math.round((aiEnhancedCount / docs.length) * 100),

      keywords: {
        total: totalKeywords,
        unique: Object.keys(keywordDistribution).length,
        averagePerDoc: Math.round((totalKeywords / docs.length) * 10) / 10,
        mostCommon: Object.entries(keywordDistribution)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([keyword, count]) => ({ keyword, count })),
      },

      tags: {
        total: totalTags,
        unique: Object.keys(tagDistribution).length,
        averagePerDoc: Math.round((totalTags / docs.length) * 10) / 10,
        mostCommon: Object.entries(tagDistribution)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([tag, count]) => ({ tag, count })),
      },

      content: {
        totalWords: docs.reduce((sum, doc) => sum + (doc.wordCount || 0), 0),
        averageWordsPerDoc: Math.round(
          docs.reduce((sum, doc) => sum + (doc.wordCount || 0), 0) /
            docs.length,
        ),
      },
    }
  }

  /**
   * Write search index to static files
   */
  async writeIndex(searchIndex) {
    const outputPath = this.options.outputPath
    console.log(`💾 Writing search index to: ${outputPath}`)

    try {
      // Ensure output directory exists
      await fs.ensureDir(path.dirname(outputPath))

      // Write main search index
      await fs.writeFile(outputPath, JSON.stringify(searchIndex, null, 2))

      // Write stats file for debugging/analytics
      const statsPath = outputPath.replace('.json', '-stats.json')
      await fs.writeFile(statsPath, JSON.stringify(searchIndex.stats, null, 2))

      // Write keyword index separately for advanced search features
      const keywordIndexPath = outputPath.replace('.json', '-keywords.json')
      await fs.writeFile(
        keywordIndexPath,
        JSON.stringify(searchIndex.keywordIndex, null, 2),
      )

      console.log('✅ Search index files written successfully:')
      console.log(`   📄 Main index: ${outputPath}`)
      console.log(`   📊 Stats: ${statsPath}`)
      console.log(`   🔍 Keywords: ${keywordIndexPath}`)

      // Calculate file sizes
      const mainSize = (await fs.stat(outputPath)).size
      const statsSize = (await fs.stat(statsPath)).size
      const keywordsSize = (await fs.stat(keywordIndexPath)).size

      console.log(
        `   💾 Total index size: ${Math.round(
          (mainSize + statsSize + keywordsSize) / 1024,
        )}KB`,
      )
    } catch (error) {
      console.error('❌ Failed to write search index:', error)
      throw error
    }
  }

  /**
   * Validate search index integrity
   */
  validateIndex(searchIndex) {
    const errors = []

    if (!searchIndex.docs || !Array.isArray(searchIndex.docs)) {
      errors.push('Missing or invalid docs array')
    }

    if (
      !searchIndex.keywordIndex ||
      typeof searchIndex.keywordIndex !== 'object'
    ) {
      errors.push('Missing or invalid keyword index')
    }

    if (!searchIndex.meta || !searchIndex.meta.generated) {
      errors.push('Missing or invalid metadata')
    }

    // Check document structure
    searchIndex.docs?.forEach((doc, index) => {
      if (!doc.id) errors.push(`Document ${index} missing id`)
      if (!doc.title) errors.push(`Document ${index} missing title`)
      if (!doc.permalink) errors.push(`Document ${index} missing permalink`)
    })

    if (errors.length > 0) {
      throw new Error(`Index validation failed: ${errors.join(', ')}`)
    }

    return true
  }
}

module.exports = SearchIndexer
