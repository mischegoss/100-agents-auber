/**
 * Keyword Extraction Agent
 * Uses Google Gemini to analyze document content and enhance metadata
 * Note: Using simple class instead of extending KaibanJS Agent to avoid constructor issues
 */
class KeywordExtractionAgent {
  constructor() {
    this.name = 'keyword-extraction-agent'
    this.role = 'Content Analysis Specialist'
    this.goal =
      'Analyze documentation content to extract keywords, improve metadata, and enhance discoverability using AI-powered analysis'
    this.backstory = `You are an expert content analyst specializing in documentation optimization. 
                    You excel at understanding technical content, extracting meaningful keywords, 
                    and creating metadata that improves document discoverability and RAG effectiveness.
                    You use Google Gemini AI to perform deep content analysis and generate high-quality 
                    descriptions, tags, and categories that make documentation more searchable and useful.`
    this.verbose = true
    this.allowDelegation = false
    this.maxIter = 3
    this.memory = true
  }

  /**
   * Analyze document content and generate enhanced metadata
   */
  async analyzeContent(filePath, content, currentMetadata = {}) {
    console.log(`🔍 [Keyword Agent] Analyzing: ${filePath}`)

    try {
      // Parse the document to separate content from frontmatter
      const matter = require('gray-matter')
      const parsed = matter(content)

      // Prepare analysis request
      const analysisContext = {
        title: parsed.data.title || 'Untitled',
        content: parsed.content,
        currentMetadata: parsed.data,
        wordCount: parsed.content.split(/\s+/).length,
        headings: this.extractHeadings(parsed.content),
      }

      // Generate enhanced metadata using Gemini
      const enhancedMetadata = await this.generateEnhancedMetadata(
        analysisContext,
      )

      console.log(`✅ [Keyword Agent] Enhanced metadata for: ${filePath}`)

      return {
        originalMetadata: parsed.data,
        enhancedMetadata,
        content: parsed.content,
        improvements: this.identifyImprovements(parsed.data, enhancedMetadata),
      }
    } catch (error) {
      console.error(
        `❌ [Keyword Agent] Error analyzing ${filePath}:`,
        error.message,
      )
      throw error
    }
  }

  /**
   * Extract headings from markdown content
   */
  extractHeadings(content) {
    const headingMatches = content.match(/^#+\s+(.+)$/gm) || []
    return headingMatches.map(heading => {
      const level = (heading.match(/^#+/) || [''])[0].length
      const text = heading.replace(/^#+\s+/, '')
      return { level, text }
    })
  }

  /**
   * Generate enhanced metadata using Gemini AI
   */
  async generateEnhancedMetadata(context) {
    // Try to load environment variables if not already loaded
    if (!process.env.GOOGLE_API_KEY) {
      try {
        const path = require('path')
        require('dotenv').config({
          path: path.join(process.cwd(), '.env.local'),
        })
      } catch (error) {
        console.warn('⚠️  Could not load .env.local file')
      }
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.error(
        '❌ [Keyword Agent] GOOGLE_API_KEY not found in environment variables',
      )
      console.log(
        '💡 [Keyword Agent] Make sure your .env.local file contains GOOGLE_API_KEY=your_api_key',
      )
      throw new Error('GOOGLE_API_KEY not found in environment variables')
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = this.buildAnalysisPrompt(context)

    try {
      console.log(`🤖 [Keyword Agent] Calling Gemini for analysis...`)
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Clean the response - remove markdown code blocks if present
      let cleanedText = text.trim()
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '')
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      // Parse the JSON response from Gemini
      const enhancedMetadata = JSON.parse(cleanedText)

      // Ensure required fields have at least one value (Docusaurus validation)
      if (
        !enhancedMetadata.keywords ||
        enhancedMetadata.keywords.length === 0
      ) {
        enhancedMetadata.keywords = ['documentation']
      }
      if (!enhancedMetadata.tags || enhancedMetadata.tags.length === 0) {
        enhancedMetadata.tags = ['documentation']
      }
      if (!enhancedMetadata.topics || enhancedMetadata.topics.length === 0) {
        enhancedMetadata.topics = ['general']
      }

      // Convert snake_case to camelCase for better JavaScript compatibility
      if (enhancedMetadata.rag_score) {
        enhancedMetadata.ragScore = enhancedMetadata.rag_score
      }
      if (enhancedMetadata.rag_improvements) {
        enhancedMetadata.ragImprovements = enhancedMetadata.rag_improvements
      }

      // Ensure keywords are also included in tags for better search indexing
      // Docusaurus search definitely indexes tags, but may not index custom keyword fields
      const combinedTags = [
        ...new Set([...enhancedMetadata.tags, ...enhancedMetadata.keywords]),
      ]
      enhancedMetadata.tags = combinedTags.slice(0, 10) // Limit to 10 to avoid clutter

      console.log(`🎯 [Keyword Agent] Gemini analysis complete`)
      return enhancedMetadata
    } catch (error) {
      console.error('❌ [Keyword Agent] Gemini API error:', error.message)
      // Fallback to basic analysis if Gemini fails
      return this.fallbackAnalysis(context)
    }
  }

  /**
   * Build the analysis prompt for Gemini
   */
  buildAnalysisPrompt(context) {
    return `You are a documentation metadata expert. Analyze this technical document and generate enhanced metadata for better RAG effectiveness and searchability.
  
  DOCUMENT TO ANALYZE:
  Title: ${context.title}
  Word Count: ${context.wordCount}
  Headings: ${context.headings
    .map(h => `${'#'.repeat(h.level)} ${h.text}`)
    .join('\n')}
  
  CONTENT:
  ${context.content.substring(0, 2000)}${
      context.content.length > 2000 ? '...' : ''
    }
  
  CURRENT METADATA:
  ${JSON.stringify(context.currentMetadata, null, 2)}
  
  Generate enhanced metadata as valid JSON with these fields:
  {
    "title": "Improved title if needed (keep original if good)",
    "description": "Clear, SEO-friendly description (2-3 sentences)",
    "tags": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "keywords": ["semantic-keyword1", "semantic-keyword2", "semantic-keyword3"],
    "category": "primary-category",
    "difficulty": "beginner|intermediate|advanced",
    "topics": ["main-topic1", "main-topic2"],
    "related": ["related-concept1", "related-concept2"],
    "rag_score": 85,
    "rag_improvements": ["improvement1", "improvement2"]
  }
  
  Rules:
  - Keep existing title if it's already good
  - Description should be concise but informative
  - Tags should be specific and relevant to the content
  - Keywords should capture semantic meaning
  - Category should reflect the primary purpose
  - RAG score (1-100) based on content clarity, structure, completeness
  - RAG improvements should suggest specific enhancements
  
  Return ONLY valid JSON, no additional text.`
  }

  /**
   * Fallback analysis if Gemini fails
   */
  fallbackAnalysis(context) {
    console.log(
      `🔄 [Keyword Agent] Using fallback analysis for: ${context.title}`,
    )

    const words = context.content.toLowerCase().split(/\s+/)
    const commonWords = [
      'the',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'may',
      'might',
      'can',
      'this',
      'that',
      'these',
      'those',
    ]

    // Extract potential keywords
    const keywordCandidates = words
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1
        return acc
      }, {})

    const topKeywords = Object.entries(keywordCandidates)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word)

    // Ensure we always have at least one keyword and tag (Docusaurus requirement)
    const finalKeywords =
      topKeywords.length > 0 ? topKeywords : ['documentation']
    const finalTags = topKeywords.slice(0, 5)
    if (finalTags.length === 0) finalTags.push('documentation')

    // Combine keywords and tags for better search indexing
    const combinedTags = [...new Set([...finalTags, ...finalKeywords])]
    const searchableTags = combinedTags.slice(0, 10) // Limit to 10 to avoid clutter

    // Generate better topics from headings
    const topics =
      context.headings.length > 0
        ? context.headings
            .slice(0, 3)
            .map(h => h.text.toLowerCase().replace(/\s+/g, '-'))
        : ['general']

    return {
      title: context.title || 'Documentation',
      description: `Documentation for ${
        context.title || 'this topic'
      }. This guide covers key concepts and procedures.`,
      tags: searchableTags,
      keywords: finalKeywords,
      category: 'documentation',
      difficulty:
        context.wordCount < 200
          ? 'beginner'
          : context.wordCount < 400
          ? 'intermediate'
          : 'advanced',
      topics: topics,
      related: [],
      ragScore: Math.min(
        85,
        Math.max(40, context.wordCount / 5 + context.headings.length * 10),
      ),
      ragImprovements: [
        'Add more cross-references',
        'Improve heading structure',
        'Add examples',
      ],
    }
  }

  /**
   * Identify what improvements were made
   */
  identifyImprovements(original, enhanced) {
    const improvements = []

    if (!original.description && enhanced.description) {
      improvements.push('Added description')
    }

    if (!original.tags && enhanced.tags) {
      improvements.push('Added tags')
    }

    if (!original.keywords && enhanced.keywords) {
      improvements.push('Added keywords')
    }

    if (!original.category && enhanced.category) {
      improvements.push('Added category')
    }

    if (enhanced.rag_score) {
      improvements.push(`RAG score: ${enhanced.rag_score}/100`)
    }

    return improvements
  }
}

module.exports = KeywordExtractionAgent
