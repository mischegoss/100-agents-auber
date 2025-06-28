const path = require('path')
const fs = require('fs-extra')

// Enhanced metadata constants with all three agents
const ENHANCED_METADATA = {
  'account-lockout': {
    // SEO Agent metadata
    description:
      'Comprehensive guide to preventing and resolving account lockouts, including timeout policies and recovery procedures',
    keywords: [
      'authentication',
      'lockout',
      'security',
      'timeout',
      'access-control',
      'failed-login',
      'account-recovery',
      'session-management',
    ],
    focusKeyword: 'authentication',
    searchKeywords: ['authentication', 'lockout', 'security'],
    contentType: 'troubleshooting',
    seoScore: 92,

    // Taxonomy Agent metadata
    topics: ['authentication', 'security-procedures', 'access-control'],
    difficulty: 'intermediate',
    audience: ['developers', 'system-administrators'],
    targetRoles: ['devops-engineer', 'security-specialist'],
    prerequisites: ['basic-authentication', 'system-administration'],
    domainArea: 'security',
    taxonomyScore: 88,

    // Chunking Agent metadata
    chunkingStrategy: 'semantic',
    optimalChunkSize: 450,
    chunkOverlap: 75,
    totalChunks: 6,
    chunkBoundaries: ['heading-based', 'semantic-breaks'],
    semanticBridges: [
      'intro-to-prevention',
      'prevention-to-resolution',
      'resolution-to-monitoring',
    ],
    contextualAnchors: [
      'lockout-triggers',
      'recovery-process',
      'prevention-strategies',
    ],
    ragOptimizations: {
      vectorSearchKeywords: [
        'lockout',
        'timeout',
        'authentication',
        'security',
      ],
      semanticClusters: ['auth-security', 'troubleshooting', 'system-admin'],
      retrievalHints: 'Focus on error scenarios and step-by-step procedures',
    },
    chunkingScore: 90,
    structureScore: 85,
    ragScore: 92,
    enhancementLevel: 'comprehensive',
  },

  'auth-tokens': {
    description:
      'Complete guide to authentication token management, including JWT implementation, security best practices, and lifecycle management',
    keywords: [
      'authentication',
      'tokens',
      'JWT',
      'security',
      'oauth',
      'bearer-token',
      'session-management',
    ],
    focusKeyword: 'authentication-tokens',
    searchKeywords: ['tokens', 'JWT', 'authentication'],
    contentType: 'reference',
    seoScore: 89,
    topics: ['authentication', 'token-management', 'security'],
    difficulty: 'advanced',
    audience: ['developers', 'security-engineers'],
    targetRoles: ['backend-developer', 'security-specialist'],
    prerequisites: ['authentication-concepts', 'oauth-basics'],
    domainArea: 'security',
    taxonomyScore: 91,
    chunkingStrategy: 'hybrid',
    optimalChunkSize: 500,
    chunkOverlap: 80,
    totalChunks: 8,
    chunkBoundaries: ['heading-based', 'code-blocks', 'semantic-breaks'],
    semanticBridges: [
      'concepts-to-implementation',
      'implementation-to-security',
      'security-to-lifecycle',
    ],
    contextualAnchors: [
      'jwt-structure',
      'token-validation',
      'refresh-patterns',
    ],
    ragOptimizations: {
      vectorSearchKeywords: [
        'JWT',
        'token',
        'bearer',
        'oauth',
        'authentication',
      ],
      semanticClusters: [
        'token-auth',
        'security-implementation',
        'api-security',
      ],
      retrievalHints:
        'Focus on implementation patterns and security considerations',
    },
    chunkingScore: 93,
    structureScore: 88,
    ragScore: 91,
    enhancementLevel: 'comprehensive',
  },

  'tutorial-basics': {
    description:
      'Essential tutorial covering fundamental concepts and getting started with the system',
    keywords: [
      'tutorial',
      'basics',
      'getting-started',
      'fundamentals',
      'introduction',
    ],
    focusKeyword: 'tutorial',
    searchKeywords: ['tutorial', 'basics', 'getting-started'],
    contentType: 'tutorial',
    seoScore: 85,
    topics: ['fundamentals', 'getting-started', 'tutorial'],
    difficulty: 'beginner',
    audience: ['beginners', 'developers'],
    targetRoles: ['new-developer', 'student'],
    prerequisites: [],
    domainArea: 'education',
    taxonomyScore: 82,
    chunkingStrategy: 'structural',
    optimalChunkSize: 350,
    chunkOverlap: 60,
    totalChunks: 5,
    chunkBoundaries: ['heading-based', 'step-boundaries'],
    semanticBridges: [
      'intro-to-setup',
      'setup-to-usage',
      'usage-to-next-steps',
    ],
    contextualAnchors: ['first-steps', 'basic-concepts', 'next-actions'],
    ragOptimizations: {
      vectorSearchKeywords: [
        'tutorial',
        'basics',
        'getting started',
        'introduction',
      ],
      semanticClusters: ['learning', 'fundamentals', 'beginner-guide'],
      retrievalHints:
        'Focus on step-by-step instructions and foundational concepts',
    },
    chunkingScore: 87,
    structureScore: 83,
    ragScore: 85,
    enhancementLevel: 'comprehensive',
  },
}

function createMockDoc(id, type) {
  const isEnhanced = type === 'enhanced'
  const baseUrl = isEnhanced
    ? '/docs-enhanced/sample-docs'
    : '/docs-original/sample-docs'

  const title = id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  const metadata = isEnhanced ? ENHANCED_METADATA[id] : null

  // Generate mock content based on document type
  const content = generateMockContent(id, metadata)
  const headings = extractHeadings(content)

  return {
    id,
    title,
    content,
    headings,
    frontMatter: {
      title,
      description: metadata?.description || 'Basic documentation page.',
      keywords: metadata?.keywords || ['documentation'],
      ...(metadata && {
        focusKeyword: metadata.focusKeyword,
        searchKeywords: metadata.searchKeywords,
        contentType: metadata.contentType,
        seoScore: metadata.seoScore,
        topics: metadata.topics,
        difficulty: metadata.difficulty,
        audience: metadata.audience,
        targetRoles: metadata.targetRoles,
        prerequisites: metadata.prerequisites,
        domainArea: metadata.domainArea,
        taxonomyScore: metadata.taxonomyScore,
        chunkingStrategy: metadata.chunkingStrategy,
        optimalChunkSize: metadata.optimalChunkSize,
        chunkOverlap: metadata.chunkOverlap,
        totalChunks: metadata.totalChunks,
        chunkBoundaries: metadata.chunkBoundaries,
        semanticBridges: metadata.semanticBridges,
        contextualAnchors: metadata.contextualAnchors,
        ragOptimizations: metadata.ragOptimizations,
        chunkingScore: metadata.chunkingScore,
        structureScore: metadata.structureScore,
        ragScore: metadata.ragScore,
        enhancementLevel: metadata.enhancementLevel,
      }),
    },
    url: `${baseUrl}/${id}`,
    isEnhanced,
    enhancementLevel: metadata?.enhancementLevel || 'basic',
    ragScore: metadata?.ragScore || null,
    seoScore: metadata?.seoScore || null,
    taxonomyScore: metadata?.taxonomyScore || null,
    chunkingScore: metadata?.chunkingScore || null,
    structureScore: metadata?.structureScore || null,
    semanticKeywords: metadata?.ragOptimizations?.vectorSearchKeywords || [],
    semanticClusters: metadata?.ragOptimizations?.semanticClusters || [],
    retrievalHints: metadata?.ragOptimizations?.retrievalHints || null,
    chunkingInfo: metadata
      ? {
          strategy: metadata.chunkingStrategy,
          size: metadata.optimalChunkSize,
          overlap: metadata.chunkOverlap,
          count: metadata.totalChunks,
          anchors: metadata.contextualAnchors,
        }
      : null,
  }
}

function generateMockContent(id, metadata) {
  const baseContent = `This is the content for ${id.replace(
    /-/g,
    ' ',
  )}. It contains information about ${id.replace(/-/g, ' ')}.`

  // Add more realistic content for enhanced docs
  if (metadata) {
    return `${baseContent}

## Overview
${metadata.description}

## Key Topics
${metadata.topics?.join(', ') || 'Various topics'}

## Prerequisites
${
  metadata.prerequisites?.length
    ? metadata.prerequisites.join(', ')
    : 'No prerequisites required'
}

## Difficulty Level
This content is designed for ${metadata.difficulty} users.

## Target Audience
${metadata.audience?.join(', ') || 'General users'}

${
  metadata.retrievalHints ||
  'Additional implementation details and examples would go here.'
}
`
  }

  return baseContent
}

function extractHeadings(content) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      id: match[2]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    })
  }

  return headings
}

function createChunks(doc) {
  if (!doc.chunkingInfo) {
    return [
      {
        id: `${doc.id}-chunk-1`,
        content: doc.content,
        startOffset: 0,
        endOffset: doc.content.length,
        semanticAnchor: doc.id,
        contextBridge: null,
        vectorKeywords: doc.semanticKeywords.slice(0, 3),
      },
    ]
  }

  const { size, overlap, count, anchors } = doc.chunkingInfo
  const chunks = []
  const contentLength = doc.content.length

  for (let i = 0; i < count; i++) {
    const start = i * (size - overlap)
    const end = Math.min(start + size, contentLength)

    chunks.push({
      id: `${doc.id}-chunk-${i + 1}`,
      content: doc.content.slice(start, end),
      startOffset: start,
      endOffset: end,
      semanticAnchor: anchors?.[i] || `${doc.id}-section-${i + 1}`,
      contextBridge: doc.frontMatter.semanticBridges?.[i] || null,
      vectorKeywords: doc.semanticKeywords.slice(0, 3),
    })
  }

  return chunks
}

function buildSearchIndices(docs) {
  const keywordIndex = {}
  const semanticClusters = {}
  const facetedIndex = {
    byDifficulty: {},
    byContentType: {},
    byTopic: {},
    byAudience: {},
  }

  docs.forEach(doc => {
    // Build keyword index
    const allKeywords = [
      ...doc.frontMatter.keywords,
      ...doc.semanticKeywords,
      doc.title.toLowerCase().split(' '),
    ].flat()

    allKeywords.forEach(keyword => {
      if (!keywordIndex[keyword]) {
        keywordIndex[keyword] = []
      }
      keywordIndex[keyword].push({
        docId: doc.id,
        frequency: (
          doc.content.toLowerCase().match(new RegExp(keyword, 'g')) || []
        ).length,
        title: doc.title,
      })
    })

    // Build semantic clusters
    doc.semanticClusters.forEach(cluster => {
      if (!semanticClusters[cluster]) {
        semanticClusters[cluster] = {
          documents: [],
          keywords: new Set(),
        }
      }
      semanticClusters[cluster].documents.push(doc.id)
      doc.semanticKeywords.forEach(kw =>
        semanticClusters[cluster].keywords.add(kw),
      )
    })

    // Build faceted indices
    const difficulty = doc.frontMatter.difficulty
    if (difficulty) {
      if (!facetedIndex.byDifficulty[difficulty])
        facetedIndex.byDifficulty[difficulty] = []
      facetedIndex.byDifficulty[difficulty].push(doc.id)
    }

    const contentType = doc.frontMatter.contentType
    if (contentType) {
      if (!facetedIndex.byContentType[contentType])
        facetedIndex.byContentType[contentType] = []
      facetedIndex.byContentType[contentType].push(doc.id)
    }

    const topics = doc.frontMatter.topics || []
    topics.forEach(topic => {
      if (!facetedIndex.byTopic[topic]) facetedIndex.byTopic[topic] = []
      facetedIndex.byTopic[topic].push(doc.id)
    })

    const audience = doc.frontMatter.audience || []
    audience.forEach(aud => {
      if (!facetedIndex.byAudience[aud]) facetedIndex.byAudience[aud] = []
      facetedIndex.byAudience[aud].push(doc.id)
    })
  })

  // Convert semantic clusters keywords Set to Array
  Object.keys(semanticClusters).forEach(cluster => {
    semanticClusters[cluster].keywords = Array.from(
      semanticClusters[cluster].keywords,
    )
  })

  return {
    keyword: keywordIndex,
    semantic: { clusters: semanticClusters },
    faceted: facetedIndex,
  }
}

function createSearchIndex(docs, type) {
  const enhancedDocs = docs.filter(doc => doc.isEnhanced)
  const basicDocs = docs.filter(doc => !doc.isEnhanced)
  const searchIndices = buildSearchIndices(docs)

  return {
    metadata: {
      version: '2.1.0',
      type: type,
      generatedAt: new Date().toISOString(),
      totalDocuments: docs.length,
      enhancedDocuments: enhancedDocs.length,
      enhancementRate: Math.round((enhancedDocs.length / docs.length) * 100),
    },

    searchConfig: {
      vectorDimensions: 1536,
      chunkingEnabled: true,
      hybridSearchEnabled: true,
      semanticThreshold: 0.75,
      keywordBoost: 1.2,
      contextWindowSize: 512,
    },

    taxonomies: {
      topics: [...new Set(docs.flatMap(d => d.frontMatter.topics || []))],
      difficulties: [
        ...new Set(docs.map(d => d.frontMatter.difficulty).filter(Boolean)),
      ],
      audiences: [...new Set(docs.flatMap(d => d.frontMatter.audience || []))],
      contentTypes: [
        ...new Set(docs.map(d => d.frontMatter.contentType).filter(Boolean)),
      ],
      domainAreas: [
        ...new Set(docs.map(d => d.frontMatter.domainArea).filter(Boolean)),
      ],
    },

    agentStats: {
      seoEnhanced: enhancedDocs.filter(d => d.seoScore).length,
      taxonomyEnhanced: enhancedDocs.filter(d => d.taxonomyScore).length,
      chunkingEnhanced: enhancedDocs.filter(d => d.chunkingScore).length,
      averageRAGScore:
        enhancedDocs.length > 0
          ? Math.round(
              enhancedDocs.reduce((acc, doc) => acc + (doc.ragScore || 0), 0) /
                enhancedDocs.length,
            )
          : 0,
    },

    chunkingStats: {
      averageChunkSize:
        enhancedDocs.length > 0
          ? Math.round(
              enhancedDocs.reduce(
                (acc, doc) => acc + (doc.chunkingInfo?.size || 0),
                0,
              ) / enhancedDocs.length,
            )
          : 0,
      totalChunks: enhancedDocs.reduce(
        (acc, doc) => acc + (doc.chunkingInfo?.count || 0),
        0,
      ),
      strategiesUsed: [
        ...new Set(
          enhancedDocs.map(d => d.chunkingInfo?.strategy).filter(Boolean),
        ),
      ],
    },

    documents: docs.map(doc => {
      const chunks = createChunks(doc)

      return {
        id: doc.id,
        title: doc.title,
        url: doc.url,

        searchMetadata: {
          primaryKeywords:
            doc.frontMatter.searchKeywords ||
            doc.frontMatter.keywords?.slice(0, 3) ||
            [],
          secondaryKeywords: doc.frontMatter.keywords || [],
          semanticKeywords: doc.semanticKeywords,
          focusKeyword: doc.frontMatter.focusKeyword,
          contentType: doc.frontMatter.contentType,
          searchBoost: doc.ragScore ? 1 + doc.ragScore / 100 : 1.0,
        },

        content: {
          fullText: doc.content,
          summary: doc.frontMatter.description,
          headings: doc.headings.map(h => h.text),
        },

        chunking: {
          strategy: doc.chunkingInfo?.strategy || 'basic',
          optimalSize: doc.chunkingInfo?.size || 300,
          overlap: doc.chunkingInfo?.overlap || 50,
          totalChunks: chunks.length,
          boundaries: doc.frontMatter.chunkBoundaries || ['paragraph'],
          chunks: chunks,
        },

        classification: {
          topics: doc.frontMatter.topics || [],
          difficulty: doc.frontMatter.difficulty,
          audience: doc.frontMatter.audience || [],
          targetRoles: doc.frontMatter.targetRoles || [],
          prerequisites: doc.frontMatter.prerequisites || [],
          domainArea: doc.frontMatter.domainArea,
          estimatedReadTime: Math.ceil(doc.content.split(' ').length / 200),
        },

        ragOptimizations: {
          retrievalHints: doc.retrievalHints,
          semanticClusters: doc.semanticClusters,
          contextualAnchors: doc.frontMatter.contextualAnchors || [],
          semanticBridges: doc.frontMatter.semanticBridges || [],
        },

        qualityScores: {
          overall: doc.ragScore || 50,
          seo: doc.seoScore || 50,
          taxonomy: doc.taxonomyScore || 50,
          chunking: doc.chunkingScore || 50,
          structure: doc.structureScore || 50,
          searchability: doc.ragScore ? Math.min(100, doc.ragScore + 10) : 60,
        },

        relationships: {
          relatedDocs: getRelatedDocs(doc, docs),
          prerequisites: doc.frontMatter.prerequisites || [],
          nextSteps: getNextSteps(doc, docs),
          semanticSimilarity: calculateSemanticSimilarity(doc, docs),
        },

        searchHints: {
          commonQueries: generateCommonQueries(doc),
          intentMapping: calculateIntentMapping(doc),
          queryExpansions: generateQueryExpansions(doc),
        },

        // Legacy fields for backwards compatibility
        isEnhanced: doc.isEnhanced,
        enhancementLevel: doc.enhancementLevel,
        ragScore: doc.ragScore,
        keywords: doc.frontMatter.keywords || [],
        description: doc.frontMatter.description,
      }
    }),

    searchIndices: searchIndices,

    searchFeatures: {
      autoComplete: {
        suggestions: generateAutocompleteSuggestions(docs),
      },

      spellCorrection: {
        corrections: generateSpellCorrections(docs),
      },

      queryExpansion: {
        synonyms: generateSynonyms(docs),
        related: generateRelatedTerms(docs),
      },
    },

    analytics: {
      topQueries: [], // Would be populated by usage analytics
      clickthrough: {},
      searchPatterns: {
        commonPaths: [],
        exitPoints: [],
      },
    },
  }
}

function getRelatedDocs(doc, docs) {
  return docs
    .filter(d => d.id !== doc.id)
    .filter(d => {
      const commonTopics = (doc.frontMatter.topics || []).filter(topic =>
        (d.frontMatter.topics || []).includes(topic),
      )
      return commonTopics.length > 0
    })
    .slice(0, 3)
    .map(d => d.id)
}

function getNextSteps(doc, docs) {
  const difficulty = doc.frontMatter.difficulty
  const nextLevel =
    difficulty === 'beginner'
      ? 'intermediate'
      : difficulty === 'intermediate'
      ? 'advanced'
      : null

  if (!nextLevel) return []

  return docs
    .filter(d => d.frontMatter.difficulty === nextLevel)
    .slice(0, 2)
    .map(d => d.id)
}

function calculateSemanticSimilarity(doc, docs) {
  return docs
    .filter(d => d.id !== doc.id)
    .map(d => {
      const commonKeywords = doc.semanticKeywords.filter(kw =>
        d.semanticKeywords.includes(kw),
      ).length
      const totalKeywords = new Set([
        ...doc.semanticKeywords,
        ...d.semanticKeywords,
      ]).size
      const score = totalKeywords > 0 ? commonKeywords / totalKeywords : 0

      return { docId: d.id, score: Math.round(score * 100) / 100 }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

function generateCommonQueries(doc) {
  const keywords = doc.frontMatter.keywords || []
  const contentType = doc.frontMatter.contentType

  const queries = keywords.slice(0, 3).map(kw => {
    if (contentType === 'troubleshooting') return `${kw} error`
    if (contentType === 'tutorial') return `how to ${kw}`
    return kw
  })

  return [...new Set(queries)]
}

function calculateIntentMapping(doc) {
  const contentType = doc.frontMatter.contentType
  const difficulty = doc.frontMatter.difficulty

  return {
    troubleshooting: contentType === 'troubleshooting' ? 0.9 : 0.1,
    learning:
      contentType === 'tutorial' || difficulty === 'beginner' ? 0.8 : 0.2,
    reference: contentType === 'reference' ? 0.9 : 0.3,
  }
}

function generateQueryExpansions(doc) {
  const expansions = {}
  const keywords = doc.frontMatter.keywords || []

  keywords.forEach(keyword => {
    if (keyword.includes('-')) {
      expansions[keyword] = keyword.split('-')
    }
  })

  return expansions
}

function generateAutocompleteSuggestions(docs) {
  const suggestions = []
  const keywords = docs.flatMap(d => d.frontMatter.keywords || [])
  const uniqueKeywords = [...new Set(keywords)]

  uniqueKeywords.slice(0, 20).forEach(keyword => {
    suggestions.push({
      query: keyword.slice(0, 4),
      completions: uniqueKeywords
        .filter(kw => kw.startsWith(keyword.slice(0, 4)))
        .slice(0, 3),
    })
  })

  return suggestions
}

function generateSpellCorrections(docs) {
  // Simple typo corrections for common terms
  return {
    athentication: 'authentication',
    lockot: 'lockout',
    tokn: 'token',
    cofiguration: 'configuration',
    integation: 'integration',
  }
}

function generateSynonyms(docs) {
  return {
    login: ['signin', 'authenticate', 'access'],
    token: ['JWT', 'bearer token', 'access token'],
    lockout: ['locked', 'blocked', 'disabled'],
    configuration: ['config', 'setup', 'settings'],
  }
}

function generateRelatedTerms(docs) {
  return {
    authentication: ['authorization', 'access control', 'security'],
    troubleshooting: ['debugging', 'problem solving', 'error resolution'],
    tutorial: ['guide', 'walkthrough', 'how-to'],
    configuration: ['setup', 'installation', 'deployment'],
  }
}

async function extractDocsContent(context) {
  // In a real implementation, you'd extract from Docusaurus content
  // For now, we'll create mock data based on our known docs structure

  const mockDocs = [
    'account-lockout',
    'auth-tokens',
    'credential-management',
    'credential-policy',
    'system-integration',
    'tutorial-basics',
    'configuration-basics',
    'env-setup',
    'create-a-page',
    'advanced-topics',
    'markdown-features',
    'community-guidelines',
    'release-notes',
    'audit-log-review',
  ]

  const enhanced = mockDocs.map(id => createMockDoc(id, 'enhanced'))
  const original = mockDocs.map(id => createMockDoc(id, 'original'))

  return { enhanced, original }
}

/**
 * Enhanced Search Index Generator Plugin
 * Generates optimized JSON files for both enhanced and original documentation
 * Overwrites existing files on each build to ensure fresh data
 */
function searchIndexPlugin(context, options = {}) {
  return {
    name: 'enhanced-search-index-generator',

    async postBuild({ outDir }) {
      console.log('🔍 Generating enhanced search indexes...')

      try {
        // Extract docs content (in real implementation, use actual docs)
        const { enhanced, original } = await extractDocsContent(context)

        // Create enhanced search indexes with full optimization
        const enhancedIndex = createSearchIndex(enhanced, 'enhanced')
        const originalIndex = createSearchIndex(original, 'original')

        // Ensure search data directory exists and clear any existing files
        const staticDir = path.join(outDir, 'search-data')
        await fs.ensureDir(staticDir)

        // Remove existing JSON files to ensure clean overwrite
        const existingFiles = await fs.readdir(staticDir).catch(() => [])
        for (const file of existingFiles) {
          if (file.endsWith('.json')) {
            await fs.remove(path.join(staticDir, file))
            console.log(`   🗑️  Removed existing file: ${file}`)
          }
        }

        // Write new JSON files (this will overwrite any remaining files)
        await fs.writeJSON(
          path.join(staticDir, 'enhanced-docs.json'),
          enhancedIndex,
          { spaces: 2 },
        )

        await fs.writeJSON(
          path.join(staticDir, 'original-docs.json'),
          originalIndex,
          { spaces: 2 },
        )

        // Generate additional search optimization files
        await fs.writeJSON(
          path.join(staticDir, 'search-config.json'),
          {
            version: enhancedIndex.metadata.version,
            searchConfig: enhancedIndex.searchConfig,
            taxonomies: enhancedIndex.taxonomies,
            lastGenerated: enhancedIndex.metadata.generatedAt,
          },
          { spaces: 2 },
        )

        console.log('✅ Enhanced search indexes generated successfully!')
        console.log(
          `   📊 Enhanced: ${enhancedIndex.metadata.totalDocuments} docs (${enhancedIndex.metadata.enhancementRate}% enhanced)`,
        )
        console.log(
          `   📄 Original: ${originalIndex.metadata.totalDocuments} docs (${originalIndex.metadata.enhancementRate}% enhanced)`,
        )
        console.log(
          `   🎯 RAG Score: ${enhancedIndex.agentStats.averageRAGScore}/100`,
        )
        console.log(
          `   📦 Total Chunks: ${enhancedIndex.chunkingStats.totalChunks}`,
        )
        console.log(`   💾 Files written to: ${staticDir}`)
      } catch (error) {
        console.error('❌ Error generating enhanced search indexes:', error)
        throw error // Re-throw to fail the build if search index generation fails
      }
    },
  }
}

module.exports = searchIndexPlugin
