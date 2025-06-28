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

    // Combined RAG Score
    ragScore: 92,
    enhancementLevel: 'comprehensive',
  },

  'auth-tokens': {
    // SEO Agent metadata
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

    // Taxonomy Agent metadata
    topics: ['authentication', 'token-management', 'security'],
    difficulty: 'advanced',
    audience: ['developers', 'security-engineers'],
    targetRoles: ['backend-developer', 'security-specialist'],
    prerequisites: ['authentication-concepts', 'oauth-basics'],
    domainArea: 'security',
    taxonomyScore: 91,

    // Chunking Agent metadata
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

    // Combined RAG Score
    ragScore: 91,
    enhancementLevel: 'comprehensive',
  },

  'tutorial-basics': {
    // SEO Agent metadata
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

    // Taxonomy Agent metadata
    topics: ['fundamentals', 'getting-started', 'tutorial'],
    difficulty: 'beginner',
    audience: ['beginners', 'developers'],
    targetRoles: ['new-developer', 'student'],
    prerequisites: [],
    domainArea: 'education',
    taxonomyScore: 82,

    // Chunking Agent metadata
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

    // Combined RAG Score
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

  return {
    id,
    title,
    content: `This is the content for ${title}. It contains information about ${id.replace(
      /-/g,
      ' ',
    )}.`,
    frontMatter: {
      title,
      description: metadata?.description || 'Basic documentation page.',
      keywords: metadata?.keywords || ['documentation'],

      // Include all agent enhancements if available
      ...(metadata && {
        // SEO enhancements
        focusKeyword: metadata.focusKeyword,
        searchKeywords: metadata.searchKeywords,
        contentType: metadata.contentType,
        seoScore: metadata.seoScore,

        // Taxonomy enhancements
        topics: metadata.topics,
        difficulty: metadata.difficulty,
        audience: metadata.audience,
        targetRoles: metadata.targetRoles,
        prerequisites: metadata.prerequisites,
        domainArea: metadata.domainArea,
        taxonomyScore: metadata.taxonomyScore,

        // Chunking enhancements
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

        // Overall enhancement metrics
        ragScore: metadata.ragScore,
        enhancementLevel: metadata.enhancementLevel,
      }),
    },
    url: `${baseUrl}/${id}`,
    isEnhanced,
    enhancementLevel: metadata?.enhancementLevel || 'basic',
    ragScore: metadata?.ragScore || null,

    // Agent-specific scores for debugging
    seoScore: metadata?.seoScore || null,
    taxonomyScore: metadata?.taxonomyScore || null,
    chunkingScore: metadata?.chunkingScore || null,
    structureScore: metadata?.structureScore || null,

    // Enhanced search capabilities
    semanticKeywords: metadata?.ragOptimizations?.vectorSearchKeywords || [],
    semanticClusters: metadata?.ragOptimizations?.semanticClusters || [],
    retrievalHints: metadata?.ragOptimizations?.retrievalHints || null,

    // Chunking information for RAG
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

function createSearchIndex(docs, type) {
  const enhancedDocs = docs.filter(doc => doc.isEnhanced)
  const basicDocs = docs.filter(doc => !doc.isEnhanced)

  return {
    version: '2.1.0',
    type: type,
    generatedAt: new Date().toISOString(),
    totalDocuments: docs.length,
    enhancedDocuments: enhancedDocs.length,
    enhancementRate: Math.round((enhancedDocs.length / docs.length) * 100),

    // Agent statistics
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

    // Chunking statistics
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

    documents: docs.map(doc => ({
      id: doc.id,
      title: doc.title,
      description: doc.frontMatter.description,
      url: doc.url,
      content: doc.content,
      keywords: doc.frontMatter.keywords || [],

      // Enhanced metadata
      isEnhanced: doc.isEnhanced,
      enhancementLevel: doc.enhancementLevel,
      ragScore: doc.ragScore,

      // Agent scores
      seoScore: doc.seoScore,
      taxonomyScore: doc.taxonomyScore,
      chunkingScore: doc.chunkingScore,
      structureScore: doc.structureScore,

      // Semantic search enhancements
      semanticKeywords: doc.semanticKeywords,
      semanticClusters: doc.semanticClusters,
      retrievalHints: doc.retrievalHints,

      // Document structure
      topics: doc.frontMatter.topics || [],
      difficulty: doc.frontMatter.difficulty,
      audience: doc.frontMatter.audience || [],
      contentType: doc.frontMatter.contentType,

      // Chunking metadata
      chunkingInfo: doc.chunkingInfo,
      contextualAnchors: doc.frontMatter.contextualAnchors || [],
      semanticBridges: doc.frontMatter.semanticBridges || [],
    })),
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
 * Search Index Generator Plugin
 * Generates JSON files for both enhanced and original documentation
 */
function searchIndexPlugin(context, options = {}) {
  return {
    name: 'search-index-generator',

    async postBuild({ outDir }) {
      console.log('🔍 Generating search indexes...')

      try {
        // Extract docs content (in real implementation, use actual docs)
        const { enhanced, original } = await extractDocsContent(context)

        // Create search indexes
        const enhancedIndex = createSearchIndex(enhanced, 'enhanced')
        const originalIndex = createSearchIndex(original, 'original')

        // Write JSON files to build output
        const staticDir = path.join(outDir, 'search-data')
        await fs.ensureDir(staticDir)

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

        console.log('✅ Search indexes generated successfully!')
        console.log(
          `   📊 Enhanced: ${enhancedIndex.totalDocuments} docs (${enhancedIndex.enhancementRate}% enhanced)`,
        )
        console.log(
          `   📄 Original: ${originalIndex.totalDocuments} docs (${originalIndex.enhancementRate}% enhanced)`,
        )
      } catch (error) {
        console.error('❌ Error generating search indexes:', error)
      }
    },
  }
}

module.exports = searchIndexPlugin
