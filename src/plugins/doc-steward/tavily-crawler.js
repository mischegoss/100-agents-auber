// src/plugins/doc-steward/tavily-crawler.js - Crawls related context using Tavily
const { tavily } = require('tavily-js')

class TavilyCrawler {
  constructor(options) {
    this.options = options
    this.client = tavily({
      apiKey: process.env.TAVILY_API_KEY,
    })

    if (!process.env.TAVILY_API_KEY) {
      console.warn(
        '⚠️ TAVILY_API_KEY not found. Context crawling will be skipped.',
      )
    }
  }

  /**
   * Crawl related context for a document to improve AI keyword generation
   */
  async crawlRelatedContext(doc) {
    if (!process.env.TAVILY_API_KEY) {
      console.log(`⚠️ Skipping Tavily crawl for ${doc.filename} (no API key)`)
      return null
    }

    try {
      console.log(`🕷️ Crawling context for: ${doc.title}`)

      // Generate search queries based on document content
      const searchQueries = this.generateSearchQueries(doc)

      const contextResults = []

      for (const query of searchQueries) {
        try {
          console.log(`   Searching: "${query}"`)

          const response = await this.client.search({
            query: query,
            max_results: this.options.tavilyMaxResults || 3,
            search_depth: 'basic',
            include_answer: true,
            include_raw_content: false,
            include_images: false,
          })

          if (response.results && response.results.length > 0) {
            contextResults.push({
              query,
              answer: response.answer,
              results: response.results.map(result => ({
                title: result.title,
                url: result.url,
                content: result.content,
                score: result.score,
              })),
            })

            console.log(`   ✅ Found ${response.results.length} results`)
          } else {
            console.log(`   ⚠️ No results for "${query}"`)
          }

          // Rate limiting - be nice to Tavily API
          await this.delay(200)
        } catch (queryError) {
          console.error(`   ❌ Query failed: "${query}"`, queryError.message)
        }
      }

      if (contextResults.length === 0) {
        console.log(`   📭 No context found for ${doc.filename}`)
        return null
      }

      // Compile context into useful format
      const context = this.compileContext(doc, contextResults)
      console.log(
        `   🎯 Compiled context from ${contextResults.length} searches`,
      )

      return context
    } catch (error) {
      console.error(
        `❌ Tavily crawl failed for ${doc.filename}:`,
        error.message,
      )
      return null
    }
  }

  /**
   * Generate search queries based on document content and metadata
   */
  generateSearchQueries(doc) {
    const queries = []

    // Query 1: Document title + related terms
    if (doc.title) {
      queries.push(`${doc.title} documentation guide tutorial`)
    }

    // Query 2: Extract key terms from content
    const keyTerms = this.extractKeyTerms(doc.content)
    if (keyTerms.length > 0) {
      queries.push(`${keyTerms.slice(0, 3).join(' ')} best practices examples`)
    }

    // Query 3: Based on existing keywords/tags
    const existingKeywords = doc.frontMatter.keywords || []
    const existingTags = doc.frontMatter.tags || []
    if (existingKeywords.length > 0 || existingTags.length > 0) {
      const terms = [...existingKeywords, ...existingTags].slice(0, 3)
      queries.push(`${terms.join(' ')} common issues solutions`)
    }

    // Query 4: Filename-based search (for technical docs)
    const filename = doc.filename.replace('.md', '').replace(/-/g, ' ')
    queries.push(`${filename} configuration setup guide`)

    // Limit to avoid too many API calls
    return queries.slice(0, 3)
  }

  /**
   * Extract key terms from document content using simple heuristics
   */
  extractKeyTerms(content) {
    if (!content) return []

    // Find terms that appear frequently and look important
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(
        word => word.length > 3 && word.length < 20 && !this.isCommonWord(word),
      )

    // Count word frequency
    const wordCount = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })

    // Get most frequent meaningful words
    return Object.entries(wordCount)
      .filter(([word, count]) => count > 1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word)
  }

  /**
   * Check if word is too common to be useful
   */
  isCommonWord(word) {
    const commonWords = [
      'the',
      'and',
      'for',
      'are',
      'but',
      'not',
      'you',
      'all',
      'can',
      'had',
      'her',
      'was',
      'one',
      'our',
      'out',
      'day',
      'get',
      'has',
      'him',
      'his',
      'how',
      'man',
      'new',
      'now',
      'old',
      'see',
      'two',
      'way',
      'who',
      'boy',
      'did',
      'its',
      'let',
      'put',
      'say',
      'she',
      'too',
      'use',
      'will',
      'with',
      'this',
      'that',
      'they',
      'have',
      'been',
      'there',
      'what',
      'were',
      'said',
      'each',
      'which',
      'their',
      'time',
      'would',
      'about',
      'could',
      'other',
      'after',
      'first',
      'never',
      'these',
      'think',
      'where',
      'being',
      'every',
      'great',
      'might',
      'shall',
      'still',
      'those',
      'under',
      'while',
    ]
    return commonWords.includes(word)
  }

  /**
   * Compile crawled context into useful format for AI
   */
  compileContext(doc, contextResults) {
    const relatedTopics = []
    const commonTerms = []
    const relatedConcepts = []
    const sources = []

    contextResults.forEach(result => {
      // Collect answers as related concepts
      if (result.answer) {
        relatedConcepts.push({
          query: result.query,
          summary: result.answer,
        })
      }

      // Extract information from search results
      result.results.forEach(item => {
        sources.push({
          title: item.title,
          url: item.url,
          relevance: item.score,
        })

        // Extract potential keywords from titles and content
        const terms = this.extractContextTerms(item.title + ' ' + item.content)
        commonTerms.push(...terms)
      })
    })

    // Find most common terms across all context
    const termFrequency = {}
    commonTerms.forEach(term => {
      termFrequency[term] = (termFrequency[term] || 0) + 1
    })

    const topTerms = Object.entries(termFrequency)
      .filter(([term, freq]) => freq > 1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([term]) => term)

    return {
      document: {
        title: doc.title,
        filename: doc.filename,
      },
      crawledAt: new Date().toISOString(),
      searchQueries: contextResults.map(r => r.query),
      relatedConcepts,
      suggestedTerms: topTerms,
      sources: sources.slice(0, 10), // Limit sources
      summary: this.createContextSummary(relatedConcepts, topTerms),
    }
  }

  /**
   * Extract terms from context content
   */
  extractContextTerms(text) {
    if (!text) return []

    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(
        word =>
          word.length > 3 &&
          word.length < 15 &&
          !this.isCommonWord(word) &&
          !word.includes('http'),
      )
      .slice(0, 20) // Limit to avoid too much data
  }

  /**
   * Create summary of crawled context
   */
  createContextSummary(concepts, terms) {
    const conceptSummary =
      concepts.length > 0
        ? `Found ${concepts.length} related concepts about ${
            concepts[0]?.query || 'the topic'
          }.`
        : 'No related concepts found.'

    const termSummary =
      terms.length > 0
        ? `Common terms: ${terms.slice(0, 5).join(', ')}.`
        : 'No common terms identified.'

    return `${conceptSummary} ${termSummary}`
  }

  /**
   * Rate limiting helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = TavilyCrawler
