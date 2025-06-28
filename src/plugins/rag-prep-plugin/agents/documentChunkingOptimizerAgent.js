/**
 * Document Chunking Optimizer Agent
 * Uses Google Gemini to analyze document structure and optimize content chunking for RAG effectiveness
 * Focuses on semantic segmentation, contextual bridges, and optimal chunk sizing
 */
class DocumentChunkingOptimizerAgent {
  constructor() {
    this.name = 'document-chunking-optimizer-agent'
    this.role = 'Document Structure Analysis Specialist'
    this.goal =
      'Optimize document structure and chunking for maximum RAG retrieval effectiveness'
    this.backstory = `You are an expert document structure analyst specializing in optimizing content organization for AI retrieval systems. 
                        You excel at analyzing document flow, creating semantic boundaries, generating contextual bridges between sections,
                        and optimizing heading hierarchies for both human readability and AI comprehension. Your chunking strategies 
                        balance context preservation with retrieval precision.`
    this.verbose = true
    this.allowDelegation = false
    this.maxIter = 3
    this.memory = true
  }

  /**
   * Analyze document content and generate optimized chunking metadata
   */
  async analyzeContent(filePath, content, currentMetadata = {}) {
    console.log(`✂️ [Chunking Agent] Analyzing: ${filePath}`)

    try {
      // Parse the document to separate content from frontmatter
      const matter = require('gray-matter')
      const parsed = matter(content)

      // Prepare analysis context
      const analysisContext = {
        title: parsed.data.title || 'Untitled',
        content: parsed.content,
        currentMetadata: parsed.data,
        wordCount: parsed.content.split(/\s+/).length,
        headings: this.extractHeadingStructure(parsed.content),
        sections: this.analyzeSectionLengths(parsed.content),
        codeBlocks: this.extractCodeBlocks(parsed.content),
        lists: this.extractLists(parsed.content),
        linkStructure: this.analyzeInternalLinks(parsed.content),
        contentFlow: this.analyzeContentFlow(parsed.content),
      }

      // Generate chunking optimization using Gemini
      const chunkingMetadata = await this.generateChunkingStrategy(
        analysisContext,
      )

      console.log(
        `✅ [Chunking Agent] Optimized document structure for: ${filePath}`,
      )

      return {
        originalMetadata: parsed.data,
        enhancedMetadata: chunkingMetadata,
        content: parsed.content,
        improvements: this.identifyImprovements(parsed.data, chunkingMetadata),
      }
    } catch (error) {
      console.error(
        `❌ [Chunking Agent] Error analyzing ${filePath}:`,
        error.message,
      )
      throw error
    }
  }

  /**
   * Extract heading structure with depth analysis
   */
  extractHeadingStructure(content) {
    const headingMatches = content.match(/^#+\s+(.+)$/gm) || []
    const structure = []

    headingMatches.forEach((heading, index) => {
      const level = (heading.match(/^#+/) || [''])[0].length
      const text = heading
        .replace(/^#+\s+/, '')
        .replace(/[#*`]/g, '')
        .trim()
      const nextHeading = headingMatches[index + 1]

      // Calculate section content (rough approximation)
      const currentPos = content.indexOf(heading)
      const nextPos = nextHeading
        ? content.indexOf(nextHeading)
        : content.length
      const sectionContent = content.substring(currentPos, nextPos)
      const wordCount = sectionContent.split(/\s+/).length

      structure.push({
        level,
        text,
        wordCount,
        hasCodeBlocks: /```/.test(sectionContent),
        hasList: /^\s*[-*+]\s+/.test(sectionContent),
        position: index,
      })
    })

    return structure
  }

  /**
   * Analyze section lengths and distribution
   */
  analyzeSectionLengths(content) {
    const sections = content.split(/^#+\s+/gm).filter(section => section.trim())

    return {
      count: sections.length,
      lengths: sections.map(section => section.split(/\s+/).length),
      averageLength:
        sections.reduce(
          (acc, section) => acc + section.split(/\s+/).length,
          0,
        ) / sections.length,
      varianceHigh:
        this.calculateVariance(sections.map(s => s.split(/\s+/).length)) > 1000,
    }
  }

  /**
   * Calculate variance for section length analysis
   */
  calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
    return (
      numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) /
      numbers.length
    )
  }

  /**
   * Extract and analyze code blocks for context
   */
  extractCodeBlocks(content) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const blocks = []
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'unknown',
        lineCount: (match[2].match(/\n/g) || []).length + 1,
        hasComments: /\/\/|\/\*|\#|<!--/.test(match[2]),
      })
    }

    return {
      count: blocks.length,
      languages: [...new Set(blocks.map(b => b.language))],
      totalLines: blocks.reduce((acc, block) => acc + block.lineCount, 0),
      contextual: blocks.some(b => b.hasComments),
    }
  }

  /**
   * Extract and analyze list structures
   */
  extractLists(content) {
    const bulletPoints = (content.match(/^\s*[-*+]\s+/gm) || []).length
    const numberedItems = (content.match(/^\s*\d+\.\s+/gm) || []).length
    const nestedLists = (content.match(/^\s{2,}[-*+\d]/gm) || []).length

    return {
      bulletPoints,
      numberedItems,
      nestedLists,
      hasComplexStructure: nestedLists > 0 || bulletPoints + numberedItems > 10,
    }
  }

  /**
   * Analyze internal link structure
   */
  analyzeInternalLinks(content) {
    const internalLinks =
      content.match(/\[([^\]]+)\]\((?!https?:\/\/)([^)]+)\)/g) || []
    const externalLinks =
      content.match(/\[([^\]]+)\]\(https?:\/\/[^)]+\)/g) || []
    const crossReferences = content.match(/see \[([^\]]+)\]/gi) || []

    return {
      internal: internalLinks.length,
      external: externalLinks.length,
      crossReferences: crossReferences.length,
      isInterconnected: internalLinks.length > 2,
    }
  }

  /**
   * Analyze content flow and transitions
   */
  analyzeContentFlow(content) {
    const transitionWords = [
      'however',
      'therefore',
      'furthermore',
      'additionally',
      'meanwhile',
      'consequently',
      'moreover',
      'nevertheless',
      'subsequently',
      'finally',
    ]

    const transitions = transitionWords.reduce((count, word) => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      return count + (content.match(regex) || []).length
    }, 0)

    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50)

    return {
      transitionCount: transitions,
      paragraphCount: paragraphs.length,
      averageParagraphLength:
        paragraphs.reduce((acc, p) => acc + p.split(/\s+/).length, 0) /
        paragraphs.length,
      hasGoodFlow: transitions > 0 && paragraphs.length > 3,
    }
  }

  /**
   * Generate comprehensive chunking strategy using Gemini AI
   */
  async generateChunkingStrategy(context) {
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
        '❌ [Chunking Agent] GOOGLE_API_KEY not found in environment variables',
      )
      throw new Error('GOOGLE_API_KEY not found in environment variables')
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = this.buildChunkingPrompt(context)

    try {
      console.log(
        `🤖 [Chunking Agent] Calling Gemini for chunking optimization...`,
      )
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Clean the response
      let cleanedText = text.trim()
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '')
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }

      // Parse the JSON response from Gemini
      const chunkingMetadata = JSON.parse(cleanedText)

      // Validate and clean the metadata
      const validatedMetadata = this.validateAndCleanChunking(chunkingMetadata)

      console.log(
        `🎯 [Chunking Agent] Document structure optimization complete`,
      )
      return validatedMetadata
    } catch (error) {
      console.error('❌ [Chunking Agent] Gemini API error:', error.message)
      // Fallback to basic chunking analysis if Gemini fails
      return this.fallbackChunkingAnalysis(context)
    }
  }

  /**
   * Build the chunking optimization prompt for Gemini
   */
  buildChunkingPrompt(context) {
    return `You are an expert document structure analyst specializing in optimizing content organization for AI retrieval systems.
  
  Analyze this technical document and create an optimal chunking strategy that maximizes RAG effectiveness while preserving semantic coherence.
  
  DOCUMENT TO ANALYZE:
  Title: ${context.title}
  Word Count: ${context.wordCount}
  Sections: ${context.sections.count} (avg: ${Math.round(
      context.sections.averageLength,
    )} words)
  Headings: ${context.headings.length} (levels: ${[
      ...new Set(context.headings.map(h => h.level)),
    ].join(', ')})
  ${
    context.codeBlocks.count > 0
      ? `Code Blocks: ${
          context.codeBlocks.count
        } (${context.codeBlocks.languages.join(', ')})`
      : ''
  }
  ${
    context.lists.bulletPoints + context.lists.numberedItems > 0
      ? `Lists: ${context.lists.bulletPoints} bullets, ${context.lists.numberedItems} numbered`
      : ''
  }
  Content Flow: ${context.contentFlow.paragraphCount} paragraphs, ${
      context.contentFlow.transitionCount
    } transitions
  
  HEADING STRUCTURE:
  ${context.headings
    .map(
      h =>
        `${'  '.repeat(h.level - 1)}${h.level}. ${h.text} (${
          h.wordCount
        } words)`,
    )
    .join('\n')}
  
  SECTION ANALYSIS:
  ${context.sections.lengths
    .map((length, i) => `Section ${i + 1}: ${length} words`)
    .join('\n')}
  
  CONTENT PREVIEW:
  ${context.content.substring(0, 1500)}${
      context.content.length > 1500 ? '...' : ''
    }
  
  CURRENT METADATA:
  ${JSON.stringify(context.currentMetadata, null, 2)}
  
  Generate optimal chunking strategy as valid JSON:
  
  {
    "chunkingStrategy": "semantic|structural|hybrid",
    "optimalChunkSize": 400,
    "chunkOverlap": 50,
    "totalChunks": 8,
    "chunkBoundaries": ["heading-based", "semantic-breaks", "code-blocks"],
    "semanticBridges": ["intro-to-setup", "config-to-usage", "troubleshooting-links"],
    "headingOptimization": {
      "currentDepth": 3,
      "recommendedDepth": 3,
      "missingHeadings": ["Prerequisites", "Next Steps"],
      "restructuringNeeded": false
    },
    "contextualAnchors": ["authentication-flow", "error-handling", "configuration"],
    "crossReferences": ["related-auth-docs", "troubleshooting-guide"],
    "retrievalTags": ["quick-reference", "detailed-guide", "troubleshooting"],
    "chunkMetadata": {
      "preserveCodeContext": true,
      "maintainListCohesion": true,
      "respectHeadingHierarchy": true
    },
    "ragOptimizations": {
      "vectorSearchKeywords": ["authentication", "lockout", "timeout", "security"],
      "semanticClusters": ["auth-concepts", "implementation", "troubleshooting"],
      "retrievalHints": "Focus on procedural steps and error scenarios"
    },
    "structureScore": 85,
    "chunkingScore": 90
  }
  
  CHUNKING REQUIREMENTS:
  - Optimal chunk size: 300-600 words for technical documentation
  - Maintain semantic coherence within chunks
  - Preserve code block integrity
  - Create meaningful overlaps for context continuity
  - Generate contextual bridges between major sections
  - Optimize heading structure for both readability and retrieval
  - Tag chunks for specific retrieval scenarios
  - Balance detail preservation with searchability
  - Ensure cross-references are maintained and enhanced`
  }

  /**
   * Validate and clean chunking metadata
   */
  validateAndCleanChunking(metadata) {
    return {
      chunkingStrategy: metadata.chunkingStrategy || 'hybrid',
      optimalChunkSize: Math.min(
        Math.max(metadata.optimalChunkSize || 400, 200),
        800,
      ),
      chunkOverlap: Math.min(Math.max(metadata.chunkOverlap || 50, 20), 150),
      totalChunks: Math.max(metadata.totalChunks || 5, 1),
      chunkBoundaries: Array.isArray(metadata.chunkBoundaries)
        ? metadata.chunkBoundaries.slice(0, 5)
        : ['heading-based'],
      semanticBridges: Array.isArray(metadata.semanticBridges)
        ? metadata.semanticBridges.slice(0, 8)
        : [],
      headingOptimization: {
        currentDepth: metadata.headingOptimization?.currentDepth || 3,
        recommendedDepth: metadata.headingOptimization?.recommendedDepth || 3,
        missingHeadings: Array.isArray(
          metadata.headingOptimization?.missingHeadings,
        )
          ? metadata.headingOptimization.missingHeadings.slice(0, 5)
          : [],
        restructuringNeeded: Boolean(
          metadata.headingOptimization?.restructuringNeeded,
        ),
      },
      contextualAnchors: Array.isArray(metadata.contextualAnchors)
        ? metadata.contextualAnchors.slice(0, 10)
        : [],
      crossReferences: Array.isArray(metadata.crossReferences)
        ? metadata.crossReferences.slice(0, 8)
        : [],
      retrievalTags: Array.isArray(metadata.retrievalTags)
        ? metadata.retrievalTags.slice(0, 6)
        : ['documentation'],
      chunkMetadata: {
        preserveCodeContext: Boolean(
          metadata.chunkMetadata?.preserveCodeContext ?? true,
        ),
        maintainListCohesion: Boolean(
          metadata.chunkMetadata?.maintainListCohesion ?? true,
        ),
        respectHeadingHierarchy: Boolean(
          metadata.chunkMetadata?.respectHeadingHierarchy ?? true,
        ),
      },
      ragOptimizations: {
        vectorSearchKeywords: Array.isArray(
          metadata.ragOptimizations?.vectorSearchKeywords,
        )
          ? metadata.ragOptimizations.vectorSearchKeywords.slice(0, 10)
          : ['documentation'],
        semanticClusters: Array.isArray(
          metadata.ragOptimizations?.semanticClusters,
        )
          ? metadata.ragOptimizations.semanticClusters.slice(0, 5)
          : ['general'],
        retrievalHints:
          typeof metadata.ragOptimizations?.retrievalHints === 'string'
            ? metadata.ragOptimizations.retrievalHints.substring(0, 500)
            : 'General documentation content',
      },
      structureScore: Math.min(Math.max(metadata.structureScore || 70, 0), 100),
      chunkingScore: Math.min(Math.max(metadata.chunkingScore || 70, 0), 100),
      enhanced_by: 'rag-prep-plugin-chunking-agent',
      enhanced_at: new Date().toISOString(),
    }
  }

  /**
   * Fallback chunking analysis when Gemini fails
   */
  fallbackChunkingAnalysis(context) {
    const averageWordsPerChunk = 450
    const estimatedChunks = Math.max(
      Math.ceil(context.wordCount / averageWordsPerChunk),
      1,
    )

    return {
      chunkingStrategy: 'structural',
      optimalChunkSize: averageWordsPerChunk,
      chunkOverlap: 75,
      totalChunks: estimatedChunks,
      chunkBoundaries: ['heading-based'],
      semanticBridges: [],
      headingOptimization: {
        currentDepth: Math.max(...context.headings.map(h => h.level), 1),
        recommendedDepth: 3,
        missingHeadings: [],
        restructuringNeeded: false,
      },
      contextualAnchors: context.headings.slice(0, 5).map(h =>
        h.text
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, ''),
      ),
      crossReferences: [],
      retrievalTags: ['documentation'],
      chunkMetadata: {
        preserveCodeContext: context.codeBlocks.count > 0,
        maintainListCohesion: context.lists.hasComplexStructure,
        respectHeadingHierarchy: true,
      },
      ragOptimizations: {
        vectorSearchKeywords: [context.title.toLowerCase()],
        semanticClusters: ['general'],
        retrievalHints: 'Standard technical documentation',
      },
      structureScore: 60,
      chunkingScore: 65,
      enhanced_by: 'rag-prep-plugin-chunking-agent-fallback',
      enhanced_at: new Date().toISOString(),
    }
  }

  /**
   * Identify what chunking improvements were made
   */
  identifyImprovements(original, enhanced) {
    const improvements = []

    if (!original.chunkingStrategy && enhanced.chunkingStrategy) {
      improvements.push(`Added ${enhanced.chunkingStrategy} chunking strategy`)
    }

    if (!original.optimalChunkSize && enhanced.optimalChunkSize) {
      improvements.push(
        `Optimized chunk size: ${enhanced.optimalChunkSize} words`,
      )
    }

    if (!original.semanticBridges && enhanced.semanticBridges?.length) {
      improvements.push(
        `Created ${enhanced.semanticBridges.length} semantic bridges`,
      )
    }

    if (!original.contextualAnchors && enhanced.contextualAnchors?.length) {
      improvements.push(
        `Added ${enhanced.contextualAnchors.length} contextual anchors`,
      )
    }

    if (!original.ragOptimizations && enhanced.ragOptimizations) {
      improvements.push('Added RAG-specific optimizations')
    }

    if (enhanced.headingOptimization?.missingHeadings?.length) {
      improvements.push(
        `Identified ${enhanced.headingOptimization.missingHeadings.length} missing headings`,
      )
    }

    if (enhanced.chunkingScore) {
      improvements.push(
        `Chunking optimization score: ${enhanced.chunkingScore}/100`,
      )
    }

    if (enhanced.structureScore) {
      improvements.push(
        `Document structure score: ${enhanced.structureScore}/100`,
      )
    }

    return improvements
  }
}

module.exports = DocumentChunkingOptimizerAgent
