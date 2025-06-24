x // src/plugins/doc-steward/ai-enhancer.js - Generates AI-enhanced keywords using Gemini
const { GoogleGenerativeAI } = require('@google/generative-ai')

class AIEnhancer {
  constructor(options) {
    this.options = options
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    this.model = this.genAI.getGenerativeModel({
      model: options.aiModel || 'gemini-2.0-flash',
    })

    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY environment variable is required')
    }
  }

  /**
   * Generate AI-enhanced keywords and tags for a document
   */
  async generateEnhancements(doc, context = null) {
    try {
      console.log(`🤖 Generating AI enhancements for: ${doc.title}`)

      // Create comprehensive prompt with context
      const prompt = this.createEnhancementPrompt(doc, context)

      // Get AI suggestions
      const suggestions = await this.callAI(prompt)

      // Validate and clean suggestions
      const cleanedSuggestions = this.validateSuggestions(suggestions, doc)

      console.log(
        `   🎯 Generated ${cleanedSuggestions.keywords.length} keywords, ${cleanedSuggestions.tags.length} tags`,
      )

      return {
        ...cleanedSuggestions,
        context: context
          ? {
              used: true,
              sources: context.sources?.length || 0,
              queries: context.searchQueries?.length || 0,
            }
          : { used: false },
      }
    } catch (error) {
      console.error(
        `❌ AI enhancement failed for ${doc.filename}:`,
        error.message,
      )
      return this.generateFallbackSuggestions(doc, context)
    }
  }

  /**
   * Create comprehensive prompt for AI enhancement
   */
  createEnhancementPrompt(doc, context) {
    let prompt = `
You are an expert at improving documentation search and discoverability. Your goal is to suggest keywords and tags that will help users FIND this documentation when they search.

DOCUMENT ANALYSIS:
Title: "${doc.title}"
Filename: "${doc.filename}"
Description: "${doc.description || 'None provided'}"
Word Count: ${doc.wordCount}
Content Preview: "${doc.content.substring(0, 800)}..."

CURRENT METADATA:
Keywords: ${JSON.stringify(doc.frontMatter.keywords || [])}
Tags: ${JSON.stringify(doc.frontMatter.tags || [])}
`

    // Add context if available from Tavily
    if (context) {
      prompt += `
EXTERNAL CONTEXT (from web research):
Related Concepts:
${
  context.relatedConcepts?.map(c => `- ${c.query}: ${c.summary}`).join('\n') ||
  'None found'
}

Suggested Terms from Research: ${
        context.suggestedTerms?.join(', ') || 'None found'
      }

Context Summary: ${context.summary}
`
    }

    prompt += `
TASK:
Generate 5-8 NEW keywords and 2-4 NEW tags that:

1. SEARCHABILITY: Users would naturally type these when looking for this content
2. DISCOVERABILITY: Include synonyms, alternative terms, and related concepts  
3. TECHNICAL ACCURACY: Use correct technical terminology
4. USER INTENT: Cover both beginner and expert search patterns
5. UNIQUENESS: Don't duplicate existing keywords/tags
6. CONTEXT AWARENESS: ${
      context
        ? 'Incorporate insights from the external research above'
        : 'Focus on document content only'
    }

EXAMPLES of good keyword suggestions:
- For "Authentication Guide" → ["login", "oauth", "security", "credentials", "session", "jwt"]
- For "API Setup" → ["endpoints", "integration", "rest", "configuration", "sdk"]
- For "Environment Variables" → ["config", "env", "settings", "deployment", "secrets"]

RESPONSE FORMAT (JSON only):
{
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "tags": ["tag1", "tag2"],
  "reasoning": "Brief explanation of why these suggestions improve search discoverability${
    context ? ', incorporating insights from web research' : ''
  }"
}

Focus on terms that solve the "I can't find what I'm looking for" problem.`

    return prompt
  }

  /**
   * Call AI model with retry logic
   */
  async callAI(prompt, retries = 2) {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
      try {
        const result = await this.model.generateContent(prompt)
        const response = await result.response
        const text = response.text().trim()

        // Clean up response (remove markdown formatting)
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim()

        // Parse JSON response
        const suggestions = JSON.parse(cleanText)

        // Validate response structure
        if (!suggestions.keywords || !Array.isArray(suggestions.keywords)) {
          throw new Error('Invalid response: missing or invalid keywords array')
        }

        if (!suggestions.tags || !Array.isArray(suggestions.tags)) {
          throw new Error('Invalid response: missing or invalid tags array')
        }

        return suggestions
      } catch (error) {
        console.error(`   ⚠️ AI attempt ${attempt} failed:`, error.message)

        if (attempt <= retries) {
          console.log(`   🔄 Retrying AI call (${attempt}/${retries})...`)
          await this.delay(1000 * attempt) // Exponential backoff
        } else {
          throw error
        }
      }
    }
  }

  /**
   * Validate and clean AI suggestions
   */
  validateSuggestions(suggestions, doc) {
    const existingKeywords = (doc.frontMatter.keywords || []).map(k =>
      k.toLowerCase(),
    )
    const existingTags = (doc.frontMatter.tags || []).map(t => t.toLowerCase())

    // Clean and validate keywords
    const keywords = (suggestions.keywords || [])
      .filter(kw => typeof kw === 'string' && kw.trim().length > 0)
      .map(kw => kw.trim())
      .filter(kw => kw.length > 1 && kw.length < 50)
      .filter(kw => !existingKeywords.includes(kw.toLowerCase()))
      .slice(0, 8) // Limit to 8 keywords

    // Clean and validate tags
    const tags = (suggestions.tags || [])
      .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 1 && tag.length < 30)
      .filter(tag => !existingTags.includes(tag))
      .slice(0, 4) // Limit to 4 tags

    return {
      keywords,
      tags,
      reasoning:
        suggestions.reasoning ||
        'AI-generated keywords and tags for improved search discoverability',
      model: this.options.aiModel,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Generate fallback suggestions when AI fails
   */
  generateFallbackSuggestions(doc, context) {
    console.log(`   🛡️ Generating fallback suggestions for ${doc.filename}`)

    const keywords = []
    const tags = ['documentation']

    // Extract from filename
    const filenameTerms = doc.filename
      .replace('.md', '')
      .split('-')
      .filter(term => term.length > 2)
    keywords.push(...filenameTerms)

    // Extract from title
    if (doc.title) {
      const titleTerms = doc.title
        .toLowerCase()
        .split(/\s+/)
        .filter(term => term.length > 2 && !this.isCommonWord(term))
      keywords.push(...titleTerms)
    }

    // Use context suggestions if available
    if (context && context.suggestedTerms) {
      keywords.push(...context.suggestedTerms.slice(0, 3))
    }

    // Apply synonyms for common patterns
    const enhancedKeywords = this.applySynonymMap(keywords)

    // Deduplicate and clean
    const existingKeywords = (doc.frontMatter.keywords || []).map(k =>
      k.toLowerCase(),
    )
    const finalKeywords = [...new Set(enhancedKeywords)]
      .filter(kw => !existingKeywords.includes(kw.toLowerCase()))
      .slice(0, 6)

    return {
      keywords: finalKeywords,
      tags,
      reasoning:
        'Fallback keywords generated from document analysis and filename patterns',
      model: 'fallback',
      generatedAt: new Date().toISOString(),
      context: context ? { used: true, fallback: true } : { used: false },
    }
  }

  /**
   * Apply synonym mapping for common technical terms
   */
  applySynonymMap(keywords) {
    const synonymMap = {
      auth: ['authentication', 'login', 'security'],
      token: ['session', 'credential', 'key'],
      env: ['environment', 'configuration', 'setup'],
      system: ['integration', 'api', 'service'],
      credential: ['password', 'secret', 'key'],
      config: ['configuration', 'settings', 'setup'],
      deploy: ['deployment', 'production', 'hosting'],
      setup: ['installation', 'configuration', 'getting-started'],
    }

    const enhanced = [...keywords]

    keywords.forEach(keyword => {
      const synonyms = synonymMap[keyword.toLowerCase()]
      if (synonyms) {
        enhanced.push(...synonyms)
      }
    })

    return enhanced
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
    ]
    return commonWords.includes(word.toLowerCase())
  }

  /**
   * Rate limiting helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

module.exports = AIEnhancer
