import React, { useState, useRef, useEffect } from 'react'

function SearchWidget({
  mode = 'original', // 'original' | 'enhanced'
  title = null,
  jsonFile = null,
  placeholder = null,
  maxResults = 3,
  showKeywords = true,
  compact = false,
}) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [documentCache, setDocumentCache] = useState(null)
  const [searchStage, setSearchStage] = useState('')
  const [searchIndex, setSearchIndex] = useState(null)
  const [loadingError, setLoadingError] = useState(null)
  const [aiResponse, setAiResponse] = useState(null)
  const [aiSources, setAiSources] = useState([])
  const searchRef = useRef(null)

  // Determine configuration based on mode
  const getConfig = () => {
    const isEnhanced = mode === 'enhanced'

    return {
      isEnhanced,
      title: title || (isEnhanced ? 'RAG-AI Enhanced Search' : 'Basic Search'),
      jsonFile:
        jsonFile ||
        (isEnhanced
          ? '/search-data/enhanced-docs.json'
          : '/search-data/original-docs.json'),
      placeholder:
        placeholder ||
        (isEnhanced
          ? '🤖 Ask me anything about the docs...'
          : '🔍 Search documentation...'),
      badge: isEnhanced ? '🤖 RAG-AI' : '📄 Basic',
      primaryColor: isEnhanced ? '#28a745' : '#6c757d',
      accentColor: isEnhanced ? '#d4edda' : '#f8f9fa',
      borderColor: isEnhanced ? '#c3e6cb' : '#dee2e6',
    }
  }

  const config = getConfig()

  // Demo questions based on mode
  const demoQuestions = {
    original: [
      'authentication setup',
      'credential management',
      'tutorial basics',
      'configuration',
      'token',
      'How do I resolve account lockout issues step by step?',
      'What are JWT token security best practices and common pitfalls?',
      'How do I troubleshoot authentication timeout problems?',
      'What is the difference between credential policies and token management?',
    
    ],
    enhanced: [
      'authentication setup',
      'credential management',
      'tutorial basics',
      'configuration',
      'token',
      'How do I resolve account lockout issues step by step?',
      'What are JWT token security best practices and common pitfalls?',
      'How do I troubleshoot authentication timeout problems?',
      'What is the difference between credential policies and token management?',
  
    ],
  }

  /**
   * Load documents from the generated JSON files
   */
  const loadDocumentsFromJSON = async () => {
    console.log(
      `🔍 [${mode.toUpperCase()}] Loading search index from: ${
        config.jsonFile
      }`,
    )
    setLoadingError(null)

    try {
      const response = await fetch(config.jsonFile)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const searchIndexData = await response.json()
      console.log(`📚 [${mode.toUpperCase()}] Loaded search index:`)
      console.log(
        `   📊 Total documents: ${searchIndexData.metadata.totalDocuments}`,
      )
      console.log(
        `   🎯 Enhancement rate: ${searchIndexData.metadata.enhancementRate}%`,
      )

      if (searchIndexData.agentStats?.averageRAGScore) {
        console.log(
          `   🧠 Average RAG score: ${searchIndexData.agentStats.averageRAGScore}`,
        )
      }

      setSearchIndex(searchIndexData)
      setDocumentCache(searchIndexData.documents)
      return searchIndexData.documents
    } catch (error) {
      console.error(
        `❌ [${mode.toUpperCase()}] Failed to load search index:`,
        error.message,
      )
      setLoadingError(error.message)
      setDocumentCache([])
      return []
    }
  }

  // Load documents on component mount and mode change
  useEffect(() => {
    loadDocumentsFromJSON()
  }, [mode, config.jsonFile])

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
   * STAGE 1: Meta-tag filtering (same for both modes)
   */
  const performStage1MetaFilter = (query, documents) => {
    console.log(
      `🔍 [${mode.toUpperCase()}] STAGE 1: Meta-tag filtering for query: "${query}"`,
    )
    setSearchStage('Stage 1: Scanning metadata...')

    const q = query.toLowerCase()
    const candidateDocs = []

    documents.forEach(doc => {
      const keywordMatch = (doc.keywords || []).some(
        keyword =>
          keyword.toLowerCase().includes(q) ||
          q.includes(keyword.toLowerCase()),
      )
      const titleMatch = doc.title.toLowerCase().includes(q)
      const descriptionMatch = (doc.description || '').toLowerCase().includes(q)
      const contentMatch = (doc.content?.fullText || doc.content || '')
        .toLowerCase()
        .includes(q)

      if (keywordMatch || titleMatch || descriptionMatch || contentMatch) {
        candidateDocs.push({
          ...doc,
          stage1Reason: keywordMatch
            ? 'keyword-match'
            : titleMatch
            ? 'title-match'
            : descriptionMatch
            ? 'description-match'
            : 'content-match',
          matchedKeywords: (doc.keywords || []).filter(
            k => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()),
          ),
        })
        console.log(`✅ [${mode.toUpperCase()}] STAGE 1 PASS: ${doc.title}`)
      }
    })

    console.log(
      `📊 [${mode.toUpperCase()}] STAGE 1 RESULTS: ${
        candidateDocs.length
      } documents passed filter`,
    )
    return candidateDocs.slice(0, 3) // Limit to top 3 candidates
  }

  /**
   * STAGE 2A: Basic scoring for original mode
   */
  const performBasicScoring = (candidateDocs, query) => {
    const q = query.toLowerCase()

    return candidateDocs
      .map(doc => {
        let relevanceScore = 0

        if (doc.title.toLowerCase().includes(q)) relevanceScore += 50
        if ((doc.description || '').toLowerCase().includes(q))
          relevanceScore += 30
        if (
          (doc.content?.fullText || doc.content || '').toLowerCase().includes(q)
        )
          relevanceScore += 20
        if (doc.matchedKeywords?.length > 0) relevanceScore += 25

        return {
          ...doc,
          relevanceScore,
          aiProcessed: false,
          excerpt: createExcerpt(
            doc.content?.fullText || doc.content || '',
            query,
          ),
        }
      })
      .filter(r => r.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
  }

  /**
   * STAGE 2B: AI-powered grounded search for enhanced mode
   */
  const performAIGroundedSearch = async (query, candidateDocs) => {
    console.log(
      `🤖 [ENHANCED] STAGE 2: AI grounded search on ${candidateDocs.length} candidates`,
    )
    setSearchStage('Stage 2: AI analyzing documents...')

    try {
      // Load Google Generative AI (same pattern as plugin agents)
      const { GoogleGenerativeAI } = require('@google/generative-ai')

      // Check for API key (same fallback pattern as plugins)
      const geminiKey =
        process.env.GOOGLE_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY

      if (!geminiKey) {
        console.error('❌ [ENHANCED] No Gemini API key found')
        throw new Error('Gemini API key not configured')
      }

      const genAI = new GoogleGenerativeAI(geminiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.3, // Lower temperature for more factual responses
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 1024,
        },
      })

      // Build grounded prompt
      const prompt = buildGroundedPrompt(query, candidateDocs)

      console.log('🔑 [ENHANCED] Calling Gemini with grounded prompt...')

      // Call Gemini API
      const result = await model.generateContent(prompt)
      const response = await result.response
      const aiText = response.text()

      console.log('🎯 [ENHANCED] AI response generated successfully')

      // Parse the response
      const parsedResponse = parseAIResponse(aiText)

      setAiResponse(parsedResponse.answer)

      // Calculate relevance scores and extract insights
      const enhancedResults = candidateDocs.map(doc => {
        const relevanceScore = calculateRelevanceScore(doc, query, aiText)
        const insight = extractDocumentInsight(doc, aiText)

        return {
          ...doc,
          relevanceScore,
          aiProcessed: true,
          excerpt: createExcerpt(
            doc.content?.fullText || doc.content || '',
            query,
          ),
          aiInsight: insight,
        }
      })

      // Set sources for display
      const sources = enhancedResults
        .filter(doc => doc.relevanceScore > 30)
        .map(doc => ({ id: doc.id, title: doc.title, url: doc.url }))
      setAiSources(sources)

      return enhancedResults.sort((a, b) => b.relevanceScore - a.relevanceScore)
    } catch (error) {
      console.error('❌ [ENHANCED] AI grounded search failed:', error.message)
      setSearchStage('AI search failed, using basic search')

      // Fallback to basic scoring
      return performBasicScoring(candidateDocs, query)
    }
  }

  /**
   * Build grounded prompt for Gemini
   */
  const buildGroundedPrompt = (query, documents) => {
    const docsContext = documents
      .map(
        doc => `
DOCUMENT: ${doc.title}
CONTENT: ${(doc.content?.fullText || doc.content || '').substring(0, 1500)}
URL: ${doc.url}
---`,
      )
      .join('\n')

    return `You are a helpful documentation assistant. Answer the user's question based ONLY on the provided documentation. Do not make up information or reference external sources.

IMPORTANT RULES:
1. Base your answer ONLY on the provided documents
2. If the documents don't contain enough information, say so
3. Cite which documents you're referencing
4. Be concise but helpful
5. If the question can't be answered from the docs, explain what's missing

USER QUESTION: ${query}

AVAILABLE DOCUMENTATION:
${docsContext}

Please provide a helpful answer based on these documents. Start your response with a direct answer, then mention which documents you referenced.`
  }

  /**
   * Parse AI response to extract answer and confidence
   */
  const parseAIResponse = aiText => {
    // Clean up the response
    const cleanAnswer = aiText
      .replace(/^```[\w]*\n?/, '') // Remove code block markers
      .replace(/\n?```$/, '')
      .trim()

    return {
      answer: cleanAnswer,
      confidence: 0.85, // Could be calculated based on response quality
    }
  }

  /**
   * Calculate relevance score based on AI analysis
   */
  const calculateRelevanceScore = (doc, query, aiResponse) => {
    let score = 50 // Base score

    // Check if document was mentioned in AI response
    if (aiResponse.toLowerCase().includes(doc.title.toLowerCase())) {
      score += 40
    }

    // Check for keyword matches
    const queryWords = query.toLowerCase().split(' ')
    const titleWords = doc.title.toLowerCase().split(' ')
    const matches = queryWords.filter(word =>
      titleWords.some(titleWord => titleWord.includes(word)),
    )
    score += matches.length * 10

    // Enhanced doc bonus
    if (doc.isEnhanced) {
      score += 15
    }

    // RAG score influence
    if (doc.qualityScores?.overall) {
      score += Math.floor(doc.qualityScores.overall / 10)
    }

    return Math.min(100, score)
  }

  /**
   * Extract insights about how document relates to query
   */
  const extractDocumentInsight = (doc, aiResponse) => {
    // Simple insight extraction - in production this could be more sophisticated
    const title = doc.title.toLowerCase()
    if (aiResponse.toLowerCase().includes(title)) {
      return 'Referenced in AI response'
    }
    return null
  }

  /**
   * Main search function - orchestrates both stages
   */
  const performSearch = async searchQuery => {
    if (!searchQuery.trim() || !documentCache) {
      setSearchResults([])
      setAiResponse(null)
      setAiSources([])
      setIsOpen(false)
      return
    }

    setIsSearching(true)
    setIsOpen(true)
    setAiResponse(null)
    setAiSources([])

    try {
      // STAGE 1: Metadata filtering (same for both)
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

      // STAGE 2: Different processing based on mode
      let finalResults
      if (config.isEnhanced) {
        finalResults = await performAIGroundedSearch(
          searchQuery,
          stage1Candidates,
        )
        setSearchStage(
          `🤖 AI analysis complete - ${finalResults.length} results`,
        )
      } else {
        finalResults = performBasicScoring(stage1Candidates, searchQuery)
        setSearchStage(
          `📄 Basic search complete - ${finalResults.length} results`,
        )
      }

      setSearchResults(finalResults.slice(0, maxResults))
      setIsSearching(false)
    } catch (error) {
      console.error(`❌ [${mode.toUpperCase()}] Search error:`, error.message)
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

  const handleDemoQuestion = question => {
    setQuery(question)
    performSearch(question)
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
    console.log('Navigate to:', result.url)
    window.location.href = result.url
  }

  const getEnhancementStats = () => {
    if (!searchIndex) return 'Loading docs...'
    if (loadingError) return `Error: ${loadingError}`

    const { totalDocuments, enhancementRate } = searchIndex.metadata
    const averageRAGScore = searchIndex.agentStats?.averageRAGScore

    if (config.isEnhanced) {
      return `${totalDocuments} docs (${enhancementRate}% enhanced${
        averageRAGScore ? `, avg RAG: ${averageRAGScore}` : ''
      })`
    } else {
      return `${totalDocuments} docs (${enhancementRate}% enhanced)`
    }
  }

  const widgetStyles = {
    container: {
      position: 'relative',
      width: '100%',
      maxWidth: compact ? '400px' : '600px',
      margin: compact ? '0' : '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      border: `2px solid ${config.borderColor}`,
      borderRadius: '12px',
      padding: '20px',
      backgroundColor: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    title: {
      fontSize: '18px',
      fontWeight: '700',
      color: config.primaryColor,
      marginBottom: '12px',
      textAlign: 'center',
    },
    searchInput: {
      width: '100%',
      padding: compact ? '10px 14px' : '14px 18px',
      fontSize: compact ? '14px' : '16px',
      border: `2px solid ${config.primaryColor}`,
      borderRadius: '10px',
      outline: 'none',
      transition: 'all 0.2s ease',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      opacity: loadingError ? 0.6 : 1,
    },
    contextBadge: {
      position: 'absolute',
      top: '-10px',
      right: '12px',
      backgroundColor: config.primaryColor,
      color: 'white',
      fontSize: '11px',
      padding: '4px 8px',
      borderRadius: '6px',
      fontWeight: '700',
      textTransform: 'uppercase',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    statusIndicator: {
      fontSize: '11px',
      color: loadingError ? '#dc3545' : '#666',
      textAlign: 'right',
      marginBottom: '6px',
      fontWeight: '500',
    },
    groundedNotice: {
      backgroundColor: config.accentColor,
      border: `1px solid ${config.borderColor}`,
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '16px',
      fontSize: '13px',
      color: config.isEnhanced ? '#155724' : '#856404',
    },
    demoButtons: {
      marginBottom: '16px',
    },
    demoButtonsTitle: {
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#495057',
    },
    demoButton: {
      backgroundColor: config.accentColor,
      border: `1px solid ${config.primaryColor}`,
      borderRadius: '6px',
      padding: '6px 10px',
      margin: '3px',
      fontSize: '11px',
      cursor: 'pointer',
      display: 'inline-block',
      transition: 'all 0.2s ease',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: '0',
      right: '0',
      backgroundColor: 'white',
      border: '1px solid #e1e1e1',
      borderRadius: '10px',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      maxHeight: '500px',
      overflowY: 'auto',
      marginTop: '6px',
    },
    aiResponseSection: {
      backgroundColor: '#f8f9fa',
      borderBottom: '2px solid #e9ecef',
      padding: '16px',
    },
    aiResponse: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#495057',
      marginBottom: '12px',
      whiteSpace: 'pre-wrap',
    },
    sourcesTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6c757d',
      marginBottom: '6px',
    },
    sourcesList: {
      fontSize: '11px',
      color: '#6c757d',
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
      color: config.primaryColor,
      margin: '0 0 6px 0',
      lineHeight: '1.3',
    },
    resultExcerpt: {
      fontSize: compact ? '12px' : '13px',
      color: '#666',
      margin: '0 0 10px 0',
      lineHeight: '1.5',
    },
    resultMeta: {
      fontSize: '11px',
      color: '#888',
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    noResults: {
      padding: '24px',
      textAlign: 'center',
      color: '#666',
      fontSize: '14px',
    },
    loading: {
      padding: '24px',
      textAlign: 'center',
      color: '#666',
      fontSize: '14px',
    },
    disclaimer: {
      marginTop: '12px',
      fontSize: '10px',
      color: '#6c757d',
      textAlign: 'center',
      fontStyle: 'italic',
    },
  }

  return (
    <div ref={searchRef} style={widgetStyles.container}>
      <div style={widgetStyles.contextBadge}>{config.badge}</div>

      <h3 style={widgetStyles.title}>{config.title}</h3>

      <div style={widgetStyles.statusIndicator}>{getEnhancementStats()}</div>

      {/* Grounded Search Notice */}
      <div style={widgetStyles.groundedNotice}>
        {config.isEnhanced ? (
          <>
            <strong>🛡️ Grounded AI Search:</strong> Our AI only answers based on
            the documentation provided. It cannot make up information or
            reference external sources, ensuring accurate and trustworthy
            responses.
          </>
        ) : (
          <>
            <strong>📋 Basic Search:</strong> Direct keyword matching in
            document metadata and content.
          </>
        )}
      </div>

      {/* Demo Question Buttons */}
      <div style={widgetStyles.demoButtons}>
        <div style={widgetStyles.demoButtonsTitle}>
          {config.isEnhanced
            ? '🤖 Try AI Questions:'
            : '🔍 Try Basic Searches:'}
        </div>
        {(config.isEnhanced
          ? demoQuestions.enhanced
          : demoQuestions.original
        ).map((question, index) => (
          <button
            key={index}
            style={widgetStyles.demoButton}
            onClick={() => handleDemoQuestion(question)}
            onMouseEnter={e => {
              e.target.style.backgroundColor = config.isEnhanced
                ? '#c3e6cb'
                : '#e9ecef'
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = config.accentColor
            }}
          >
            {question}
          </button>
        ))}
      </div>

      <input
        type='text'
        placeholder={config.placeholder}
        value={query}
        onChange={handleSearch}
        onFocus={() => query && setIsOpen(true)}
        disabled={loadingError}
        style={widgetStyles.searchInput}
      />

      {config.isEnhanced && (
        <div style={widgetStyles.disclaimer}>
        </div>
      )}

      {isOpen && (
        <div style={widgetStyles.dropdown}>
          {/* Search stage indicator */}
          {query && (
            <div
              style={{
                padding: '10px 16px',
                backgroundColor: config.accentColor,
                borderBottom: '1px solid #e1e1e1',
                fontSize: '12px',
                fontWeight: 'bold',
                color: config.isEnhanced ? '#155724' : '#856404',
              }}
            >
              {isSearching
                ? searchStage
                : config.isEnhanced
                ? '🚀 Two-Stage RAG Search: Metadata Filter → AI Grounded Analysis'
                : '📋 Basic Search: Direct Keyword Matching Only'}
            </div>
          )}

          {/* AI Response Section (Enhanced mode only) */}
          {config.isEnhanced && aiResponse && (
            <div style={widgetStyles.aiResponseSection}>
              <div style={widgetStyles.aiResponse}>
                <strong>🤖 AI Response:</strong>
                <br />
                {aiResponse}
              </div>
              {aiSources.length > 0 && (
                <>
                  <div style={widgetStyles.sourcesTitle}>📚 Sources:</div>
                  <div style={widgetStyles.sourcesList}>
                    {aiSources.map((source, index) => (
                      <span key={index}>
                        {source.title}
                        {index < aiSources.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </>
              )}
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
                      <span
                        style={{
                          backgroundColor: result.isEnhanced
                            ? '#28a745'
                            : '#6c757d',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                        }}
                      >
                        {result.isEnhanced ? '🤖 AI Enhanced' : '📄 Basic'}
                      </span>

                      {result.aiProcessed && (
                        <span
                          style={{
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                          }}
                        >
                          🧠 AI Processed
                        </span>
                      )}

                      {result.qualityScores?.overall && (
                        <span
                          style={{
                            backgroundColor: '#ffc107',
                            color: '#000',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                          }}
                        >
                          RAG: {result.qualityScores.overall}
                        </span>
                      )}

                      <span
                        style={{
                          marginLeft: 'auto',
                          color: config.primaryColor,
                          fontWeight: config.isEnhanced ? 'bold' : 'normal',
                        }}
                      >
                        Score: {result.relevanceScore}
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
                  fontSize: '11px',
                  color: '#495057',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {config.isEnhanced
                    ? '🎯 RAG-AI Enhanced Results:'
                    : '📋 Basic Search Results:'}
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {config.isEnhanced ? (
                    <>
                      <span>✅ Metadata filtered</span>
                      <span>🤖 AI grounded</span>
                      <span>🛡️ Source-verified</span>
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
                </div>
              </div>
            </>
          ) : query ? (
            <div style={widgetStyles.noResults}>
              <strong>No results found for "{query}"</strong>
              <br />
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: config.primaryColor,
                }}
              >
                {config.isEnhanced
                  ? 'Try asking complete questions like "How do I..." or use the demo buttons above'
                  : 'Try exact terms like "authentication" or "configuration"'}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SearchWidget
