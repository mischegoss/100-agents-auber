/**
 * Search Index Generator Plugin for Docusaurus
 *
 * Generates search-index-enhanced.json and search-index-original.json
 * during the build process.
 *
 * Usage in docusaurus.config.js:
 * plugins: [
 *   './src/plugins/search-index-generator.js'
 * ]
 */

const fs = require('fs')
const path = require('path')

// Enhanced metadata for AI-powered search
const ENHANCED_METADATA = {
  'account-lockout': {
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
    description:
      'Comprehensive guide to preventing and resolving account lockouts, including timeout policies and recovery procedures.',
    ragScore: 92,
    relatedDocs: ['auth-tokens', 'credential-management', 'system-integration'],
    semanticCategories: ['authentication'],
    topicClusters: ['security'],
  },
  'auth-tokens': {
    keywords: [
      'authentication',
      'tokens',
      'JWT',
      'session',
      'security',
      'expiry',
      'validation',
      'bearer-token',
      'oauth',
    ],
    description:
      'Complete reference for managing authentication tokens, including generation, validation, expiry, and security best practices.',
    ragScore: 95,
    relatedDocs: [
      'account-lockout',
      'credential-management',
      'system-integration',
    ],
    semanticCategories: ['authentication'],
    topicClusters: ['security'],
  },
  'credential-management': {
    keywords: [
      'credentials',
      'password',
      'MFA',
      'security',
      'storage',
      'encryption',
      'authentication',
      'access-control',
    ],
    description:
      'Advanced credential management including password policies, multi-factor authentication, and secure storage mechanisms.',
    ragScore: 88,
    relatedDocs: ['account-lockout', 'auth-tokens', 'credential-policy'],
    semanticCategories: ['authentication'],
    topicClusters: ['security'],
  },
  'credential-policy': {
    keywords: [
      'policy',
      'credentials',
      'security',
      'compliance',
      'governance',
      'authentication',
      'password-policy',
      'access-rules',
    ],
    description:
      'Enterprise credential policies covering password requirements, security standards, and compliance guidelines.',
    ragScore: 85,
    relatedDocs: ['credential-management', 'system-integration'],
    semanticCategories: ['authentication'],
    topicClusters: ['security'],
  },
  'system-integration': {
    keywords: [
      'integration',
      'SSO',
      'LDAP',
      'API',
      'enterprise',
      'authentication',
      'federation',
      'directory-services',
      'endpoints',
    ],
    description:
      'Enterprise system integration patterns including SSO, LDAP, and API authentication strategies.',
    ragScore: 90,
    relatedDocs: ['auth-tokens', 'credential-management', 'env-setup'],
    semanticCategories: ['system'],
    topicClusters: ['setup', 'advanced'],
  },
  'tutorial-basics': {
    keywords: [
      'tutorial',
      'getting-started',
      'beginner',
      'introduction',
      'basics',
      'first-steps',
      'onboarding',
    ],
    description:
      'Step-by-step getting started tutorial for new users with comprehensive onboarding procedures.',
    ragScore: 78,
    relatedDocs: ['configuration-basics', 'env-setup'],
    semanticCategories: ['user-guide'],
    topicClusters: ['setup'],
  },
  'configuration-basics': {
    keywords: [
      'configuration',
      'setup',
      'deployment',
      'environment',
      'installation',
      'initialization',
      'system-config',
    ],
    description:
      'Essential system configuration guide covering initial setup, deployment, and environment preparation.',
    ragScore: 80,
    relatedDocs: ['tutorial-basics', 'env-setup', 'system-integration'],
    semanticCategories: ['system'],
    topicClusters: ['setup'],
  },
  'env-setup': {
    keywords: [
      'environment',
      'setup',
      'configuration',
      'deployment',
      'infrastructure',
      'system-configuration',
      'installation',
    ],
    description:
      'Advanced environment configuration framework for production and development deployments.',
    ragScore: 87,
    relatedDocs: ['configuration-basics', 'system-integration'],
    semanticCategories: ['system'],
    topicClusters: ['setup', 'advanced'],
  },
  'create-a-page': {
    keywords: [
      'documentation',
      'page-creation',
      'content-management',
      'publishing',
      'authoring',
      'system-procedures',
    ],
    description:
      'System diagnostic procedures and page creation workflows for content management.',
    ragScore: 75,
    relatedDocs: ['markdown-features', 'tutorial-basics'],
    semanticCategories: ['user-guide'],
    topicClusters: ['content'],
  },
  'advanced-topics': {
    keywords: [
      'advanced',
      'concepts',
      'expert',
      'complex',
      'technical',
      'in-depth',
      'professional',
    ],
    description:
      'Advanced technical concepts and expert-level configuration options for experienced users.',
    ragScore: 93,
    relatedDocs: ['system-integration', 'credential-management'],
    semanticCategories: ['administration'],
    topicClusters: ['advanced', 'maintenance'],
  },
  'markdown-features': {
    keywords: [
      'markdown',
      'formatting',
      'documentation',
      'content',
      'authoring',
      'syntax',
      'writing',
    ],
    description:
      'Comprehensive markdown syntax guide and formatting options for documentation authoring.',
    ragScore: 82,
    relatedDocs: ['create-a-page', 'community-guidelines'],
    semanticCategories: ['user-guide'],
    topicClusters: ['content'],
  },
  'community-guidelines': {
    keywords: [
      'community',
      'guidelines',
      'standards',
      'best-practices',
      'collaboration',
      'social',
      'conduct',
    ],
    description:
      'Community standards, best practices, and collaboration guidelines for effective teamwork.',
    ragScore: 79,
    relatedDocs: ['markdown-features'],
    semanticCategories: ['community'],
    topicClusters: ['content'],
  },
  'release-notes': {
    keywords: [
      'release',
      'updates',
      'changelog',
      'version',
      'features',
      'improvements',
      'announcements',
    ],
    description:
      'Latest product updates, new features, and version history with detailed change documentation.',
    ragScore: 84,
    relatedDocs: ['advanced-topics'],
    semanticCategories: ['administration'],
    topicClusters: ['maintenance'],
  },
  'audit-log-review': {
    keywords: [
      'audit',
      'logging',
      'review',
      'compliance',
      'monitoring',
      'security',
      'tracking',
      'accountability',
    ],
    description:
      'Security audit procedures, log analysis, and compliance monitoring for system accountability.',
    ragScore: 86,
    relatedDocs: ['account-lockout', 'credential-policy'],
    semanticCategories: ['administration'],
    topicClusters: ['security', 'maintenance'],
  },
}

function searchIndexGeneratorPlugin(context, options) {
  return {
    name: 'search-index-generator',

    async postBuild({ siteDir, routesPaths, outDir }) {
      console.log('🔍 Generating search indexes...')

      try {
        // Get all docs content from the build context
        const docsData = await extractDocsContent(context)

        // Generate both indexes
        const enhancedIndex = generateEnhancedIndex(docsData.enhanced)
        const originalIndex = generateOriginalIndex(docsData.original)

        // Write JSON files to both static (for dev) and build output (for production)
        const staticDir = path.join(siteDir, 'static')
        const buildDir = outDir

        // Write to static directory (for development)
        await writeIndexFile(
          staticDir,
          'search-index-enhanced.json',
          enhancedIndex,
        )
        await writeIndexFile(
          staticDir,
          'search-index-original.json',
          originalIndex,
        )

        // Write to build output (for production)
        await writeIndexFile(
          buildDir,
          'search-index-enhanced.json',
          enhancedIndex,
        )
        await writeIndexFile(
          buildDir,
          'search-index-original.json',
          originalIndex,
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
      tags: metadata?.semanticCategories || [],
    },
    url: `${baseUrl}/${id}`,
    metadata,
  }
}

function generateEnhancedIndex(docs) {
  const enhancedDocs = docs.map(doc => {
    const metadata = doc.metadata || {}

    return {
      id: doc.id,
      title: doc.title,
      description: metadata.description || doc.frontMatter.description,
      keywords: metadata.keywords || ['documentation', 'guide'],
      content: extractContentPreview(doc.content, 500),
      url: doc.url,
      isEnhanced: true,
      enhancementLevel: 'ai-enhanced',
      ragScore: metadata.ragScore || 75,
      relatedDocs: metadata.relatedDocs || [],
      semanticCategories: metadata.semanticCategories || ['general'],
      topicClusters: metadata.topicClusters || ['general'],
      searchPriority: getSearchPriority(doc.id),
      lastModified: new Date().toISOString(),
      contentLength: doc.content.length,
      readingTime: Math.ceil(doc.content.split(' ').length / 200),
      tags: doc.frontMatter.tags || [],
    }
  })

  const avgRagScore = Math.round(
    enhancedDocs.reduce((sum, doc) => sum + doc.ragScore, 0) /
      enhancedDocs.length,
  )

  return {
    generated: new Date().toISOString(),
    version: '1.0.0',
    totalDocuments: enhancedDocs.length,
    enhancementRate: 100,
    averageRagScore: avgRagScore,
    capabilities: {
      semanticSearch: true,
      aiProcessing: true,
      relatedDocs: true,
      ragScoring: true,
      topicClustering: true,
    },
    documents: enhancedDocs,
  }
}

function generateOriginalIndex(docs) {
  const originalDocs = docs.map(doc => ({
    id: doc.id,
    title: doc.title,
    description: 'Basic documentation page.',
    keywords: ['documentation', 'basic', 'guide'],
    content: extractContentPreview(doc.content, 200),
    url: doc.url,
    isEnhanced: false,
    enhancementLevel: 'basic',
    lastModified: new Date().toISOString(),
  }))

  return {
    generated: new Date().toISOString(),
    version: '1.0.0',
    totalDocuments: originalDocs.length,
    enhancementRate: 0,
    capabilities: {
      semanticSearch: false,
      aiProcessing: false,
      relatedDocs: false,
      ragScoring: false,
      topicClustering: false,
    },
    documents: originalDocs,
  }
}

function extractContentPreview(content, maxLength = 300) {
  const cleanContent = content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\n+/g, ' ')
    .trim()

  return cleanContent.length > maxLength
    ? cleanContent.substring(0, maxLength) + '...'
    : cleanContent
}

function getSearchPriority(id) {
  const priorities = {
    'tutorial-basics': 10,
    'account-lockout': 9,
    'auth-tokens': 9,
    'credential-management': 8,
    'configuration-basics': 7,
    'system-integration': 6,
    'env-setup': 5,
    'advanced-topics': 4,
    'markdown-features': 3,
    'community-guidelines': 2,
    'release-notes': 1,
    'audit-log-review': 1,
  }
  return priorities[id] || 5
}

async function writeIndexFile(outputDir, filename, indexData) {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const filePath = path.join(outputDir, filename)
  fs.writeFileSync(filePath, JSON.stringify(indexData, null, 2))
  console.log(
    `   📝 Written: ${filename} (${indexData.totalDocuments} documents)`,
  )
}

module.exports = searchIndexGeneratorPlugin
