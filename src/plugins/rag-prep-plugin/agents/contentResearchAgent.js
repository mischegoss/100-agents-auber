/**
 * Content Research & Validation Agent
 * Uses Tavily API to research current industry standards, best practices, and validate content accuracy
 * Makes the system truly autonomous by gathering real-time web intelligence
 */
class ContentResearchAgent {
  constructor() {
    this.name = 'content-research-agent'
    this.role = 'Content Research & Validation Specialist'
    this.goal =
      'Research current industry standards, validate content accuracy, and discover missing information using real-time web intelligence'
    this.backstory = `You are an expert content researcher and validator specializing in technical documentation. 
                        You excel at finding current industry best practices, validating technical accuracy, discovering 
                        authoritative sources, and identifying content gaps. You use real-time web research to ensure 
                        documentation stays current with rapidly evolving technical landscapes.`
    this.verbose = true
    this.allowDelegation = false
    this.maxIter = 3
    this.memory = true
  }

  /**
   * Analyze document content and research current industry standards
   */
  async analyzeContent(filePath, content, currentMetadata = {}) {
    console.log(`🔍 [Research Agent] Analyzing: ${filePath}`)

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
        technicalTopics: this.extractTechnicalTopics(parsed.content),
        mainConcepts: this.extractMainConcepts(
          parsed.content,
          parsed.data.title,
        ),
      }

      // Research current industry standards and best practices
      const researchMetadata = await this.conductResearch(analysisContext)

      console.log(`✅ [Research Agent] Research complete for: ${filePath}`)

      return {
        originalMetadata: parsed.data,
        enhancedMetadata: researchMetadata,
        content: parsed.content,
        improvements: this.identifyImprovements(parsed.data, researchMetadata),
      }
    } catch (error) {
      console.error(
        `❌ [Research Agent] Error analyzing ${filePath}:`,
        error.message,
      )
      throw error
    }
  }

  /**
   * Extract technical topics from content for targeted research
   */
  extractTechnicalTopics(content) {
    const topics = new Set()

    // Look for technical terms, APIs, frameworks
    const patterns = [
      /\b(API|SDK|framework|library|protocol)\b/gi,
      /\b[A-Z]{2,}\b/g, // Acronyms
      /\b\w+(?:\.js|\.py|\.go|\.rs)\b/gi, // File extensions
      /\b(?:authentication|authorization|security|encryption|JWT|OAuth)\b/gi,
      /\b(?:database|SQL|MongoDB|PostgreSQL|Redis)\b/gi,
      /\b(?:React|Angular|Vue|Node|Express|FastAPI)\b/gi,
    ]

    patterns.forEach(pattern => {
      const matches = content.match(pattern) || []
      matches.forEach(match => {
        if (match.length > 2) {
          topics.add(match.toLowerCase())
        }
      })
    })

    return Array.from(topics).slice(0, 8) // Limit to top 8 topics
  }

  /**
   * Extract main concepts from title and content
   */
  extractMainConcepts(content, title) {
    const concepts = []

    if (title) {
      concepts.push(title.toLowerCase())
    }

    // Extract from headings
    const headings = content.match(/^#+\s+(.+)$/gm) || []
    headings.forEach(heading => {
      const cleanHeading = heading.replace(/^#+\s+/, '').toLowerCase()
      concepts.push(cleanHeading)
    })

    return concepts.slice(0, 5)
  }

  /**
   * Conduct comprehensive research using Tavily API
   */
  async conductResearch(context) {
    // Load environment variables
    if (!process.env.TAVILY_API_KEY) {
      try {
        const path = require('path')
        require('dotenv').config({
          path: path.join(process.cwd(), '.env.local'),
        })
      } catch (error) {
        console.warn('⚠️  Could not load .env.local file')
      }
    }

    if (!process.env.TAVILY_API_KEY) {
      console.error(
        '❌ [Research Agent] TAVILY_API_KEY not found in environment variables',
      )
      return this.fallbackResearch(context)
    }

    try {
      const { tavily } = require('@tavily/core')
      const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY })

      console.log(`🔍 [Research Agent] Conducting web research with Tavily...`)

      // Research current best practices
      const bestPracticesResults = await this.researchBestPractices(
        tavilyClient,
        context,
      )

      // Research industry standards
      const industryStandardsResults = await this.researchIndustryStandards(
        tavilyClient,
        context,
      )

      // Research authoritative sources
      const authoritativeSourcesResults =
        await this.researchAuthoritativeSources(tavilyClient, context)

      // Research related tools and technologies
      const relatedToolsResults = await this.researchRelatedTools(
        tavilyClient,
        context,
      )

      // Compile comprehensive research metadata
      const researchMetadata = this.compileResearchResults({
        bestPractices: bestPracticesResults,
        industryStandards: industryStandardsResults,
        authoritativeSources: authoritativeSourcesResults,
        relatedTools: relatedToolsResults,
        context: context,
      })

      console.log(
        `🎯 [Research Agent] Web research complete - found ${researchMetadata.researchSources.length} sources`,
      )
      return researchMetadata
    } catch (error) {
      console.error('❌ [Research Agent] Tavily API error:', error.message)
      return this.fallbackResearch(context)
    }
  }

  /**
   * Research current best practices for the topic
   */
  async researchBestPractices(tavilyClient, context) {
    const query = `${context.title} best practices 2024 documentation guidelines`

    try {
      console.log(`   📚 Researching best practices: "${query}"`)
      const response = await tavilyClient.search(query, {
        search_depth: 'basic',
        max_results: 3,
        include_domains: [
          'docs.microsoft.com',
          'developers.google.com',
          'github.com',
          'stackoverflow.com',
        ],
      })

      return {
        query: query,
        results: response.results || [],
        insights: this.extractBestPracticesInsights(response.results || []),
      }
    } catch (error) {
      console.warn(
        `⚠️ [Research Agent] Best practices research failed: ${error.message}`,
      )
      return { query, results: [], insights: [] }
    }
  }

  /**
   * Research industry standards and compliance requirements
   */
  async researchIndustryStandards(tavilyClient, context) {
    const mainTopic = context.technicalTopics[0] || context.title
    const query = `${mainTopic} industry standards compliance security 2024`

    try {
      console.log(`   📋 Researching industry standards: "${query}"`)
      const response = await tavilyClient.search(query, {
        search_depth: 'basic',
        max_results: 3,
        include_domains: [
          'nist.gov',
          'iso.org',
          'owasp.org',
          'w3.org',
          'ietf.org',
        ],
      })

      return {
        query: query,
        results: response.results || [],
        standards: this.extractStandardsInsights(response.results || []),
      }
    } catch (error) {
      console.warn(
        `⚠️ [Research Agent] Standards research failed: ${error.message}`,
      )
      return { query, results: [], standards: [] }
    }
  }

  /**
   * Research authoritative sources and official documentation
   */
  async researchAuthoritativeSources(tavilyClient, context) {
    const mainTopic = context.technicalTopics[0] || context.title
    const query = `${mainTopic} official documentation tutorial guide`

    try {
      console.log(`   🏛️ Researching authoritative sources: "${query}"`)
      const response = await tavilyClient.search(query, {
        search_depth: 'basic',
        max_results: 4,
        include_domains: [
          'github.com',
          'readthedocs.io',
          'confluence.atlassian.com',
        ],
      })

      return {
        query: query,
        results: response.results || [],
        sources: this.extractAuthoritativeSourcesInsights(
          response.results || [],
        ),
      }
    } catch (error) {
      console.warn(
        `⚠️ [Research Agent] Authoritative sources research failed: ${error.message}`,
      )
      return { query, results: [], sources: [] }
    }
  }

  /**
   * Research related tools and technologies
   */
  async researchRelatedTools(tavilyClient, context) {
    const technicalTopics = context.technicalTopics.slice(0, 3).join(' ')
    const query = `${technicalTopics} tools libraries frameworks 2024`

    try {
      console.log(`   🔧 Researching related tools: "${query}"`)
      const response = await tavilyClient.search(query, {
        search_depth: 'basic',
        max_results: 3,
      })

      return {
        query: query,
        results: response.results || [],
        tools: this.extractToolsInsights(response.results || []),
      }
    } catch (error) {
      console.warn(
        `⚠️ [Research Agent] Tools research failed: ${error.message}`,
      )
      return { query, results: [], tools: [] }
    }
  }

  /**
   * Extract actionable insights from best practices research
   */
  extractBestPracticesInsights(results) {
    const insights = []

    results.forEach(result => {
      if (result.content) {
        // Look for actionable recommendations
        const recommendations =
          result.content.match(
            /(?:should|must|recommend|best practice|tip).*?[.!]/gi,
          ) || []
        recommendations.slice(0, 2).forEach(rec => {
          insights.push({
            insight: rec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            source: result.url,
            title: result.title,
          })
        })
      }
    })

    return insights.slice(0, 5)
  }

  /**
   * Extract standards and compliance insights
   */
  extractStandardsInsights(results) {
    const standards = []

    results.forEach(result => {
      if (result.content) {
        // Look for standards references
        const standardRefs =
          result.content.match(/(?:ISO|NIST|RFC|OWASP|W3C)\s*\d+/gi) || []
        standardRefs.forEach(ref => {
          standards.push({
            standard: ref,
            source: result.url,
            context: result.title,
          })
        })
      }
    })

    return standards.slice(0, 3)
  }

  /**
   * Extract authoritative sources
   */
  extractAuthoritativeSourcesInsights(results) {
    return results
      .map(result => ({
        title: result.title,
        url: result.url,
        relevanceScore: this.calculateRelevanceScore(result),
        summary: result.content ? result.content.substring(0, 150) + '...' : '',
      }))
      .slice(0, 4)
  }

  /**
   * Extract tools and technologies insights
   */
  extractToolsInsights(results) {
    const tools = []

    results.forEach(result => {
      if (result.content) {
        // Look for tool mentions
        const toolMentions =
          result.content.match(
            /\b\w+(?:\.js|\.py|\.go|\.rs|API|SDK|CLI)\b/gi,
          ) || []
        toolMentions.slice(0, 3).forEach(tool => {
          tools.push({
            tool: tool,
            source: result.url,
            context: result.title,
          })
        })
      }
    })

    return tools.slice(0, 6)
  }

  /**
   * Calculate relevance score for sources
   */
  calculateRelevanceScore(result) {
    let score = 50 // Base score

    // Higher score for official domains
    if (result.url.includes('github.com') || result.url.includes('docs.'))
      score += 20
    if (result.url.includes('official') || result.url.includes('documentation'))
      score += 15
    if (result.title && result.title.toLowerCase().includes('guide'))
      score += 10

    return Math.min(score, 100)
  }

  /**
   * Compile comprehensive research results into content suggestions
   */
  compileResearchResults({
    bestPractices,
    industryStandards,
    authoritativeSources,
    relatedTools,
    context,
  }) {
    const currentDate = new Date().toISOString().split('T')[0]

    // Generate actual content suggestions that will be added to the document
    const contentSuggestions = this.generateContentSuggestions({
      bestPractices,
      industryStandards,
      authoritativeSources,
      relatedTools,
      context,
    })

    return {
      // Research metadata (for frontmatter)
      researchConducted: true,
      researchDate: currentDate,
      researchSources: [
        ...bestPractices.results,
        ...industryStandards.results,
        ...authoritativeSources.results,
        ...relatedTools.results,
      ].length,

      // MAIN VALUE: Actual content to add to the document
      suggestedContent: contentSuggestions,
      contentEnhancements: this.generateContentEnhancements(
        bestPractices,
        industryStandards,
        authoritativeSources,
      ),

      // Research insights for metadata
      contentGaps: this.identifyContentGaps(
        context,
        bestPractices,
        authoritativeSources,
      ),
      recommendedSections: this.generateRecommendedSections(
        bestPractices,
        industryStandards,
        authoritativeSources,
      ),

      // Research quality metrics
      researchScore: this.calculateResearchScore({
        sourcesFound:
          bestPractices.results.length +
          industryStandards.results.length +
          authoritativeSources.results.length,
        insightsExtracted:
          (bestPractices.insights?.length || 0) +
          (industryStandards.standards?.length || 0),
        authoritativeSourcesFound: authoritativeSources.sources?.length || 0,
      }),

      // Agent metadata
      enhanced_by: 'rag-prep-plugin-research-agent',
      enhanced_at: new Date().toISOString(),
      tavilyIntegration: true,
    }
  }

  /**
   * Generate actual content suggestions to add to the document
   */
  generateContentSuggestions({
    bestPractices,
    industryStandards,
    authoritativeSources,
    relatedTools,
    context,
  }) {
    let suggestions = '\n\n'

    // Add best practices section if insights found
    if (bestPractices.insights?.length > 0) {
      suggestions += `## 🏆 Current Best Practices (${new Date().getFullYear()})\n\n`
      suggestions += 'Based on recent industry research:\n\n'

      bestPractices.insights.slice(0, 3).forEach(insight => {
        suggestions += `- **${insight.insight.split('.')[0]}**: ${
          insight.insight
        }\n`
      })
      suggestions += '\n'
    }

    // Add industry standards section if standards found
    if (industryStandards.standards?.length > 0) {
      suggestions += `## 📋 Industry Standards & Compliance\n\n`

      industryStandards.standards.slice(0, 3).forEach(standard => {
        suggestions += `- **${standard.standard}**: ${standard.context}\n`
      })
      suggestions += '\n'
    }

    // Add authoritative sources section
    if (authoritativeSources.sources?.length > 0) {
      suggestions += `## 📚 Additional Resources\n\n`

      authoritativeSources.sources.slice(0, 3).forEach(source => {
        suggestions += `- [${source.title}](${source.url})\n`
      })
      suggestions += '\n'
    }

    // Add related tools section
    if (relatedTools.tools?.length > 0) {
      suggestions += `## 🔧 Related Tools & Technologies\n\n`

      const uniqueTools = [...new Set(relatedTools.tools.map(t => t.tool))]
      uniqueTools.slice(0, 4).forEach(tool => {
        suggestions += `- **${tool}**: Modern tool for ${context.title.toLowerCase()}\n`
      })
      suggestions += '\n'
    }

    return suggestions
  }

  /**
   * Generate content enhancements for existing sections
   */
  generateContentEnhancements(
    bestPractices,
    industryStandards,
    authoritativeSources,
  ) {
    const enhancements = []

    // Security enhancements
    if (
      bestPractices.insights?.some(i =>
        i.insight.toLowerCase().includes('security'),
      )
    ) {
      enhancements.push({
        section: 'Security Considerations',
        type: 'addition',
        content:
          'Consider implementing current security best practices based on 2024 industry standards.',
        priority: 'high',
      })
    }

    // Standards compliance
    if (industryStandards.standards?.length > 0) {
      enhancements.push({
        section: 'Compliance',
        type: 'addition',
        content: `Ensure compliance with current industry standards: ${industryStandards.standards
          .map(s => s.standard)
          .join(', ')}`,
        priority: 'medium',
      })
    }

    return enhancements
  }

  /**
   * Generate recommended sections based on research
   */
  generateRecommendedSections(
    bestPractices,
    industryStandards,
    authoritativeSources,
  ) {
    const sections = []

    if (bestPractices.insights?.length > 0) {
      sections.push({
        title: 'Best Practices',
        reason:
          'Found current industry best practices that should be documented',
        priority: 'high',
      })
    }

    if (industryStandards.standards?.length > 0) {
      sections.push({
        title: 'Standards & Compliance',
        reason: 'Identified relevant industry standards for compliance',
        priority: 'medium',
      })
    }

    if (authoritativeSources.sources?.length > 2) {
      sections.push({
        title: 'Additional Resources',
        reason: 'Found authoritative sources that provide valuable context',
        priority: 'low',
      })
    }

    return sections
  }
  identifyContentGaps(context, bestPractices, authoritativeSources) {
    const gaps = []

    // Check if current content covers best practices found in research
    bestPractices.insights?.forEach(insight => {
      if (
        !context.content
          .toLowerCase()
          .includes(insight.insight.toLowerCase().substring(0, 20))
      ) {
        gaps.push({
          type: 'missing_best_practice',
          recommendation: insight.insight,
          source: insight.source,
        })
      }
    })

    return gaps.slice(0, 3)
  }

  /**
   * Generate update recommendations based on research
   */
  generateUpdateRecommendations(bestPractices, industryStandards) {
    const recommendations = []

    if (bestPractices.insights?.length > 0) {
      recommendations.push({
        type: 'best_practices',
        action: 'Consider incorporating current industry best practices',
        priority: 'medium',
        sources: bestPractices.insights.slice(0, 2).map(i => i.source),
      })
    }

    if (industryStandards.standards?.length > 0) {
      recommendations.push({
        type: 'compliance',
        action: 'Review compliance with current industry standards',
        priority: 'high',
        standards: industryStandards.standards.slice(0, 2).map(s => s.standard),
      })
    }

    return recommendations
  }

  /**
   * Calculate research quality score
   */
  calculateResearchScore({
    sourcesFound,
    insightsExtracted,
    authoritativeSourcesFound,
  }) {
    let score = 50 // Base score

    score += Math.min(sourcesFound * 5, 25) // Up to 25 points for sources
    score += Math.min(insightsExtracted * 3, 15) // Up to 15 points for insights
    score += Math.min(authoritativeSourcesFound * 2.5, 10) // Up to 10 points for authoritative sources

    return Math.min(Math.round(score), 100)
  }

  /**
   * Fallback research when Tavily is unavailable
   */
  fallbackResearch(context) {
    console.log(
      '📋 [Research Agent] Using fallback research (Tavily unavailable)',
    )

    return {
      researchConducted: false,
      researchDate: new Date().toISOString().split('T')[0],
      researchSources: [],
      bestPracticesFindings: [],
      industryStandards: [],
      authoritativeSources: [],
      relatedTools: [],
      contentGaps: [],
      recommendedUpdates: [],
      externalReferences: [],
      researchScore: 30,
      enhanced_by: 'rag-prep-plugin-research-agent-fallback',
      enhanced_at: new Date().toISOString(),
      tavilyIntegration: false,
      fallbackReason: 'Tavily API unavailable',
    }
  }

  /**
   * Identify what research improvements were made
   */
  identifyImprovements(original, enhanced) {
    const improvements = []

    if (!original.researchConducted && enhanced.researchConducted) {
      improvements.push('Added real-time web research')
    }

    if (enhanced.researchSources?.length > 0) {
      improvements.push(
        `Found ${enhanced.researchSources.length} research sources`,
      )
    }

    if (enhanced.bestPracticesFindings?.length > 0) {
      improvements.push(
        `Identified ${enhanced.bestPracticesFindings.length} best practices`,
      )
    }

    if (enhanced.industryStandards?.length > 0) {
      improvements.push(
        `Found ${enhanced.industryStandards.length} industry standards`,
      )
    }

    if (enhanced.contentGaps?.length > 0) {
      improvements.push(
        `Identified ${enhanced.contentGaps.length} content gaps`,
      )
    }

    if (enhanced.researchScore) {
      improvements.push(`Research quality score: ${enhanced.researchScore}/100`)
    }

    if (enhanced.tavilyIntegration) {
      improvements.push('Tavily web intelligence integration')
    }

    return improvements
  }
}

module.exports = ContentResearchAgent
