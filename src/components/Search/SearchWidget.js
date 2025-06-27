import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from '@docusaurus/router'

function SearchWidget({
  placeholder = 'Search docs...',
  maxResults = 5,
  showKeywords = true,
  compact = false,
  forceContext = null, // Override URL-based context detection
}) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [documentCache, setDocumentCache] = useState(null)
  const [searchStage, setSearchStage] = useState('')
  const [searchIndex, setSearchIndex] = useState(null)
  const [loadingError, setLoadingError] = useState(null)
  const searchRef = useRef(null)

  // Get current location to determine which docs we're in
  const location = useLocation()

  // Determine current docs context
  const getCurrentDocsContext = () => {
    // If forceContext is provided, use it to override URL detection
    if (forceContext) {
      if (forceContext === 'docs-enhanced') {
        return {
          context: 'docs-enhanced',
          jsonFile: '/search-index-enhanced.json',
          label: 'Enhanced Docs',
        }
      } else if (forceContext === 'docs-original') {
        return {
          context: 'docs-original',
          jsonFile: '/search-index-original.json',
          label: 'Original Docs',
        }
      }
    }

    // Fall back to URL-based detection
    const path = location.pathname

    if (path.startsWith('/docs-enhanced')) {
      return {
        context: 'docs-enhanced',
        jsonFile: '/search-index-enhanced.json',
        label: 'Enhanced Docs',
      }
    } else if (path.startsWith('/docs-original')) {
      return {
        context: 'docs-original',
        jsonFile: '/search-index-original.json',
        label: 'Original Docs',
      }
    } else {
      return {
        context: 'docs-enhanced', // Default for demo
        jsonFile: '/search-index-enhanced.json',
        label: 'Enhanced Docs (Demo)',
      }
    }
  }

  const { context, jsonFile, label } = getCurrentDocsContext()

  /**
   * Load documents from the generated JSON files
   */
  const loadDocumentsFromJSON = async () => {
    console.log(`🔍 Loading search index from: ${jsonFile}`)
    setLoadingError(null)

    try {
      const response = await fetch(jsonFile)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const searchIndexData = await response.json()

      console.log(`📚 Loaded search index for ${context}:`)
      console.log(`   📊 Total documents: ${searchIndexData.totalDocuments}`)
      console.log(`   🎯 Enhancement rate: ${searchIndexData.enhancementRate}%`)

      if (searchIndexData.averageRagScore) {
        console.log(
          `   🧠 Average RAG score: ${searchIndexData.averageRagScore}`,
        )
      }

      if (searchIndexData.capabilities) {
        const capabilities = Object.entries(searchIndexData.capabilities)
          .filter(([_, enabled]) => enabled)
          .map(([name, _]) => name)
        console.log(`   ⚡ Capabilities: ${capabilities.join(', ')}`)
      }

      setSearchIndex(searchIndexData)
      setDocumentCache(searchIndexData.documents)

      return searchIndexData.documents
    } catch (error) {
      console.error(
        `❌ Failed to load search index from ${jsonFile}:`,
        error.message,
      )
      setLoadingError(error.message)

      // Fallback to empty array
      setDocumentCache([])
      return []
    }
  }

  // Load documents on component mount and context change
  useEffect(() => {
    loadDocumentsFromJSON()
  }, [context, jsonFile, forceContext])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * STAGE 1: Meta-tag filtering
   */
  const performStage1MetaFilter = (query, documents) => {
    console.log(`🔍 STAGE 1: Meta-tag filtering for query: "${query}"`)
    setSearchStage('Stage 1: Scanning metadata...')

    const q = query.toLowerCase()
    const candidateDocs = []

    documents.forEach(doc => {
      // Check if doc has meaningful keywords for this query
      const keywordMatch = doc.keywords.some(
        keyword =>
          keyword.toLowerCase().includes(q) ||
          q.includes(keyword.toLowerCase()),
      )

      const titleMatch = doc.title.toLowerCase().includes(q)
      const descriptionMatch = doc.description.toLowerCase().includes(q)
      const contentMatch = doc.content.toLowerCase().includes(q)

      // Enhanced docs get better filtering with semantic keywords
      if (
        doc.isEnhanced &&
        (keywordMatch || titleMatch || descriptionMatch || contentMatch)
      ) {
        candidateDocs.push({
          ...doc,
          stage1Reason: keywordMatch
            ? 'keyword-match'
            : titleMatch
            ? 'title-match'
            : descriptionMatch
            ? 'description-match'
            : 'content-match',
          matchedKeywords: doc.keywords.filter(
            k => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()),
          ),
        })
        console.log(
          `✅ STAGE 1 PASS: ${doc.title} (${doc.enhancementLevel}) - ${
            keywordMatch ? 'keyword' : titleMatch ? 'title' : 'description'
          } match`,
        )
      } else if (
        !doc.isEnhanced &&
        (titleMatch || descriptionMatch || contentMatch)
      ) {
        // Basic docs get through with direct matches only
        candidateDocs.push({
          ...doc,
          stage1Reason: 'direct-match',
          matchedKeywords: [],
        })
        console.log(`✅ STAGE 1 PASS: ${doc.title} (basic - direct match)`)
      } else {
        console.log(`❌ STAGE 1 SKIP: ${doc.title} (no relevant matches)`)
      }
    })

    console.log(
      `📊 STAGE 1 RESULTS: ${candidateDocs.length} documents passed filter`,
    )
    return candidateDocs
  }

  /**
   * STAGE 2: AI semantic search (for enhanced docs only)
   */
  const performStage2AISearch = async (query, candidateDocs) => {
    console.log(
      `🤖 STAGE 2: AI semantic search on ${candidateDocs.length} candidates`,
    )

    // Only apply AI search to enhanced docs
    const enhancedCandidates = candidateDocs.filter(doc => doc.isEnhanced)
    const basicCandidates = candidateDocs.filter(doc => !doc.isEnhanced)

    if (enhancedCandidates.length === 0) {
      setSearchStage('Stage 2: No enhanced docs for AI processing')
      return performBasicScoring(candidateDocs, query)
    }

    setSearchStage('Stage 2: AI semantic analysis...')

    try {
      // Simulate AI semantic search with advanced mappings
      const aiResults = await simulateAISemanticSearch(
        query,
        enhancedCandidates,
      )
      const basicResults = performBasicScoring(basicCandidates, query)

      // Combine and sort by relevance
      const allResults = [...aiResults, ...basicResults].sort(
        (a, b) => b.relevanceScore - a.relevanceScore,
      )

      return allResults
    } catch (error) {
      console.error(
        '❌ AI search failed, falling back to basic scoring:',
        error.message,
      )
      return performBasicScoring(candidateDocs, query)
    }
  }

  /**
   * Advanced AI semantic search simulation
   */
  const simulateAISemanticSearch = async (query, candidateDocs) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 600))

    const q = query.toLowerCase()

    // Advanced semantic mappings for AI-enhanced search
    const semanticMappings = {
      // Authentication ecosystem
      auth: [
        'authentication',
        'login',
        'signin',
        'access',
        'credential',
        'token',
        'session',
      ],
      login: [
        'authentication',
        'signin',
        'access',
        'credential',
        'session',
        'lockout',
      ],
      authentication: [
        'login',
        'signin',
        'access',
        'credential',
        'token',
        'security',
        'MFA',
      ],
      signin: ['login', 'authentication', 'access', 'credential'],

      // Security and access control
      lockout: [
        'locked',
        'access-control',
        'failed-login',
        'blocked',
        'timeout',
        'security',
      ],
      locked: [
        'lockout',
        'access-control',
        'failed-login',
        'blocked',
        'security',
      ],
      timeout: [
        'lockout',
        'expiry',
        'session',
        'access-control',
        'session-management',
      ],
      security: [
        'authentication',
        'access-control',
        'lockout',
        'credential',
        'encryption',
        'audit',
      ],
      access: [
        'authentication',
        'login',
        'permission',
        'credential',
        'access-control',
      ],

      // Credentials and tokens
      password: [
        'credential',
        'authentication',
        'login',
        'access',
        'security',
        'policy',
      ],
      token: [
        'authentication',
        'access',
        'credential',
        'session',
        'JWT',
        'bearer-token',
        'oauth',
      ],
      credential: [
        'password',
        'authentication',
        'login',
        'access',
        'token',
        'management',
      ],
      jwt: ['token', 'authentication', 'access', 'bearer-token', 'oauth'],

      // System and integration
      system: [
        'integration',
        'configuration',
        'setup',
        'deployment',
        'endpoints',
      ],
      integration: ['system', 'SSO', 'LDAP', 'API', 'federation', 'endpoints'],
      config: ['configuration', 'setup', 'deployment', 'environment'],
      setup: [
        'configuration',
        'installation',
        'deployment',
        'environment',
        'tutorial',
      ],
      sso: ['integration', 'federation', 'authentication', 'system'],
      ldap: ['integration', 'directory-services', 'authentication', 'system'],
      api: ['integration', 'endpoints', 'system', 'authentication'],

      // Session and lifecycle
      session: ['authentication', 'token', 'timeout', 'expiry', 'management'],
      expiry: ['timeout', 'session', 'token', 'credential'],
      expired: ['expiry', 'timeout', 'session', 'token'],
      lifecycle: ['management', 'credential', 'token', 'session'],

      // Procedures and management
      procedure: ['process', 'workflow', 'steps', 'guide', 'tutorial'],
      management: ['lifecycle', 'credential', 'administration', 'policy'],
      policy: ['credential', 'security', 'governance', 'compliance'],
      audit: ['logging', 'review', 'compliance', 'monitoring', 'security'],

      // User experience
      tutorial: [
        'guide',
        'getting-started',
        'beginner',
        'introduction',
        'basics',
      ],
      guide: ['tutorial', 'documentation', 'instructions', 'help'],
      help: ['guide', 'tutorial', 'documentation', 'support'],
    }

    const results = candidateDocs.map(doc => {
      let relevanceScore = 0

      // Direct matches get high scores
      if (doc.title.toLowerCase().includes(q)) relevanceScore += 50
      if (doc.description.toLowerCase().includes(q)) relevanceScore += 35
      if (doc.content.toLowerCase().includes(q)) relevanceScore += 25
      if (doc.matchedKeywords?.length > 0) relevanceScore += 40

      // Semantic matches using AI-powered mappings
      const semanticTerms = semanticMappings[q] || []
      let semanticMatches = []

      semanticTerms.forEach(term => {
        if (
          doc.keywords.some(k => k.toLowerCase().includes(term.toLowerCase()))
        ) {
          relevanceScore += 30
          semanticMatches.push(term)
        }
        if (doc.title.toLowerCase().includes(term)) {
          relevanceScore += 25
          if (!semanticMatches.includes(term)) semanticMatches.push(term)
        }
        if (doc.description.toLowerCase().includes(term)) {
          relevanceScore += 20
          if (!semanticMatches.includes(term)) semanticMatches.push(term)
        }
      })

      // Enhanced metadata bonuses
      if (doc.isEnhanced) {
        relevanceScore += 20 // Base enhancement bonus

        // RAG score influence
        if (doc.ragScore) {
          relevanceScore += Math.floor(doc.ragScore / 10) // 0-10 bonus based on RAG score
        }

        // Topic cluster bonus
        if (
          doc.topicClusters &&
          semanticTerms.some(term =>
            doc.topicClusters.some(cluster =>
              cluster.includes(term.split('-')[0]),
            ),
          )
        ) {
          relevanceScore += 15
        }

        // Search priority bonus
        if (doc.searchPriority) {
          relevanceScore += doc.searchPriority
        }
      }

      return {
        ...doc,
        relevanceScore,
        aiProcessed: true,
        excerpt: createExcerpt(doc.content, query),
        semanticMatches: semanticMatches.slice(0, 3), // Top 3 semantic matches
        aiConfidence: Math.min(95, relevanceScore), // Simulated AI confidence
      }
    })

    return results
      .filter(r => r.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  /**
   * Basic scoring for non-enhanced docs
   */
  const performBasicScoring = (candidateDocs, query) => {
    const q = query.toLowerCase()

    return candidateDocs
      .map(doc => {
        let relevanceScore = 0

        if (doc.title.toLowerCase().includes(q)) relevanceScore += 50
        if (doc.description.toLowerCase().includes(q)) relevanceScore += 30
        if (doc.content.toLowerCase().includes(q)) relevanceScore += 20
        if (doc.matchedKeywords?.length > 0) relevanceScore += 25

        return {
          ...doc,
          relevanceScore,
          aiProcessed: false,
          excerpt: createExcerpt(doc.content, query),
        }
      })
      .filter(r => r.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  /**
   * Main search function - orchestrates both stages
   */
  const performSearch = async searchQuery => {
    if (!searchQuery.trim() || !documentCache) {
      setSearchResults([])
      setIsOpen(false)
      return
    }

    setIsSearching(true)
    setIsOpen(true)

    try {
      // STAGE 1: Metadata filtering
      const stage1Candidates = performStage1MetaFilter(
        searchQuery,
        documentCache,
      )

      if (stage1Candidates.length === 0) {
        setSearchStage('No matching documents found')
        setSearchResults([])
        setIsSearching(false)
        return
      }

      // STAGE 2: AI semantic search (for enhanced docs)
      const finalResults = await performStage2AISearch(
        searchQuery,
        stage1Candidates,
      )

      setSearchStage(`Found ${finalResults.length} results`)
      setSearchResults(finalResults.slice(0, maxResults))
      setIsSearching(false)
    } catch (error) {
      console.error('❌ Search error:', error.message)
      setSearchStage('Search error occurred')
      setSearchResults([])
      setIsSearching(false)
    }
  }

  const createExcerpt = (content, query) => {
    if (!content) return 'No content available'

    const q = query.toLowerCase()
    const lowerContent = content.toLowerCase()
    const index = lowerContent.indexOf(q)

    if (index === -1) {
      return content.substring(0, 150) + (content.length > 150 ? '...' : '')
    }

    const start = Math.max(0, index - 50)
    const end = Math.min(content.length, index + 100)
    const excerpt = content.substring(start, end)

    return (
      (start > 0 ? '...' : '') + excerpt + (end < content.length ? '...' : '')
    )
  }

  const handleSearch = e => {
    const value = e.target.value
    setQuery(value)
    performSearch(value)
  }

  const highlightText = (text, query) => {
    if (!query || !text) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          style={{
            backgroundColor: '#ffeb3b',
            padding: '0 2px',
            borderRadius: '2px',
          }}
        >
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  const handleResultClick = result => {
    setIsOpen(false)
    setQuery('')
    // In a real Docusaurus environment, this would navigate properly
    console.log('Navigate to:', result.url)
    window.location.href = result.url
  }

  // Update placeholder based on context and capabilities
  const getContextualPlaceholder = () => {
    if (loadingError) return '❌ Search index unavailable'

    if (context === 'docs-enhanced') {
      return `🚀 Try: "auth timeout", "credential lockout", "session expiry"`
    } else {
      return `🔍 Try: "authentication", "configuration", "tutorial"`
    }
  }

  const widgetStyles = {
    container: {
      position: 'relative',
      width: '100%',
      maxWidth: compact ? '300px' : '500px',
      margin: compact ? '0' : '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    searchInput: {
      width: '100%',
      padding: compact ? '8px 12px' : '12px 16px',
      fontSize: compact ? '14px' : '16px',
      border: '2px solid #e1e1e1',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      opacity: loadingError ? 0.6 : 1,
    },
    searchInputFocused: {
      borderColor: context === 'docs-enhanced' ? '#28a745' : '#007acc',
      boxShadow: `0 0 0 3px ${
        context === 'docs-enhanced'
          ? 'rgba(40, 167, 69, 0.1)'
          : 'rgba(0, 122, 204, 0.1)'
      }`,
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: '0',
      right: '0',
      backgroundColor: 'white',
      border: '1px solid #e1e1e1',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      maxHeight: '400px',
      overflowY: 'auto',
      marginTop: '4px',
    },
    contextBadge: {
      position: 'absolute',
      top: '-8px',
      right: '8px',
      backgroundColor: context === 'docs-enhanced' ? '#28a745' : '#6c757d',
      color: 'white',
      fontSize: '10px',
      padding: '2px 6px',
      borderRadius: '4px',
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    statusIndicator: {
      fontSize: '10px',
      color: loadingError ? '#dc3545' : '#666',
      textAlign: 'right',
      marginBottom: '4px',
    },
    result: {
      padding: compact ? '12px' : '16px',
      borderBottom: '1px solid #f0f0f0',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    resultTitle: {
      fontSize: compact ? '14px' : '16px',
      fontWeight: '600',
      color: context === 'docs-enhanced' ? '#28a745' : '#007acc',
      margin: '0 0 4px 0',
      lineHeight: '1.3',
    },
    resultExcerpt: {
      fontSize: compact ? '12px' : '14px',
      color: '#666',
      margin: '0 0 8px 0',
      lineHeight: '1.4',
    },
    resultMeta: {
      fontSize: '12px',
      color: '#888',
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    noResults: {
      padding: '20px',
      textAlign: 'center',
      color: '#666',
      fontSize: '14px',
    },
    loading: {
      padding: '20px',
      textAlign: 'center',
      color: '#666',
      fontSize: '14px',
    },
  }

  // Calculate enhancement stats from loaded index
  const getEnhancementStats = () => {
    if (!searchIndex) return 'Loading docs...'

    if (loadingError) return `Error: ${loadingError}`

    const { totalDocuments, enhancementRate, averageRagScore } = searchIndex

    if (context === 'docs-enhanced') {
      return `${totalDocuments} docs (${enhancementRate}% enhanced${
        averageRagScore ? `, avg RAG: ${averageRagScore}` : ''
      })`
    } else {
      return `${totalDocuments} docs (${enhancementRate}% enhanced)`
    }
  }

  return (
    <div ref={searchRef} style={widgetStyles.container}>
      <div style={widgetStyles.contextBadge}>
        {context === 'docs-enhanced' ? 'Enhanced' : 'Original'}
      </div>

      {/* Status indicator showing enhancement stats */}
      <div style={widgetStyles.statusIndicator}>{getEnhancementStats()}</div>

      <input
        type='text'
        placeholder={getContextualPlaceholder()}
        value={query}
        onChange={handleSearch}
        onFocus={() => query && setIsOpen(true)}
        disabled={loadingError}
        style={{
          ...widgetStyles.searchInput,
          ...(isOpen ? widgetStyles.searchInputFocused : {}),
        }}
      />

      {isOpen && (
        <div style={widgetStyles.dropdown}>
          {/* Search stage indicator */}
          {query && (
            <div
              style={{
                padding: '8px 16px',
                backgroundColor:
                  context === 'docs-enhanced' ? '#d4edda' : '#fff3cd',
                borderBottom: '1px solid #e1e1e1',
                fontSize: '11px',
                fontWeight: 'bold',
                color: context === 'docs-enhanced' ? '#155724' : '#856404',
              }}
            >
              {isSearching
                ? searchStage
                : context === 'docs-enhanced'
                ? '🚀 Two-Stage AI Search: Metadata Filter → Semantic Analysis'
                : '📋 Basic Search: Direct Keyword Matching Only'}
            </div>
          )}

          {isSearching ? (
            <div style={widgetStyles.loading}>{searchStage}...</div>
          ) : searchResults.length > 0 ? (
            <>
              {searchResults.map((result, index) => (
                <div
                  key={result.id}
                  style={widgetStyles.result}
                  onClick={() => handleResultClick(result)}
                  onMouseEnter={e =>
                    (e.target.style.backgroundColor = '#f8f9fa')
                  }
                  onMouseLeave={e =>
                    (e.target.style.backgroundColor = 'transparent')
                  }
                >
                  <h4 style={widgetStyles.resultTitle}>
                    {highlightText(result.title, query)}
                  </h4>
                  <p style={widgetStyles.resultExcerpt}>
                    {highlightText(result.excerpt, query)}
                  </p>
                  {showKeywords && (
                    <div style={widgetStyles.resultMeta}>
                      {/* Enhancement level badge */}
                      <span
                        style={{
                          backgroundColor: result.isEnhanced
                            ? '#28a745'
                            : '#6c757d',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      >
                        {result.isEnhanced ? '🤖 AI Enhanced' : '📄 Basic'}
                      </span>

                      {/* AI processing indicator */}
                      {result.aiProcessed && (
                        <span
                          style={{
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                        >
                          🧠 AI Processed
                        </span>
                      )}

                      {/* RAG Score for enhanced docs */}
                      {result.ragScore && (
                        <span
                          style={{
                            backgroundColor: '#ffc107',
                            color: '#000',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}
                        >
                          RAG: {result.ragScore}
                        </span>
                      )}

                      {/* Show matched keywords */}
                      {result.matchedKeywords &&
                        result.matchedKeywords.length > 0 && (
                          <span>
                            <strong>Keywords:</strong>{' '}
                            {result.matchedKeywords.slice(0, 2).join(', ')}
                          </span>
                        )}

                      {/* Show semantic matches for AI-enhanced results */}
                      {result.semanticMatches &&
                        result.semanticMatches.length > 0 && (
                          <span style={{ color: '#28a745' }}>
                            <strong>Semantic:</strong>{' '}
                            {result.semanticMatches.slice(0, 2).join(', ')}
                          </span>
                        )}

                      {/* Relevance score */}
                      <span
                        style={{
                          marginLeft: 'auto',
                          color: result.isEnhanced ? '#28a745' : '#007acc',
                          fontWeight: result.isEnhanced ? 'bold' : 'normal',
                        }}
                      >
                        Score: {result.relevanceScore}
                        {result.aiConfidence && ` (${result.aiConfidence}%)`}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Search analytics footer */}
              <div
                style={{
                  borderTop: '2px solid #e9ecef',
                  padding: '12px 16px',
                  backgroundColor: '#f8f9fa',
                  fontSize: '12px',
                  color: '#495057',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {context === 'docs-enhanced'
                    ? '🎯 AI-Enhanced Search Results:'
                    : '📋 Basic Search Results:'}
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {context === 'docs-enhanced' ? (
                    <>
                      <span>✅ Metadata filtered</span>
                      <span>🧠 AI processed</span>
                      <span>🚀 Semantic enhanced</span>
                    </>
                  ) : (
                    <>
                      <span>📄 Direct matches only</span>
                      <span>⚠️ Limited metadata</span>
                    </>
                  )}
                  <span>Results: {searchResults.length}</span>
                  <span>
                    Enhanced: {searchResults.filter(r => r.isEnhanced).length}
                  </span>
                  {context === 'docs-enhanced' &&
                    searchResults.some(r => r.aiProcessed) && (
                      <span>
                        AI: {searchResults.filter(r => r.aiProcessed).length}
                      </span>
                    )}
                </div>
              </div>
            </>
          ) : query ? (
            <div style={widgetStyles.noResults}>
              <strong>
                No results found for "{query}"
                <br />
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: context === 'docs-enhanced' ? '#28a745' : '#dc3545',
                  }}
                >
                  {context === 'docs-enhanced'
                    ? 'Try semantic terms like "auth timeout" or "credential lockout"'
                    : 'Try exact terms like "authentication" or "configuration"'}
                </div>
              </strong>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SearchWidget
