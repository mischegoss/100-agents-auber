import React, { useState, useRef, useEffect } from 'react'
import { useAllDocsData } from '@docusaurus/plugin-content-docs/client'
import { useLocation } from '@docusaurus/router'

function SearchWidget({
  placeholder = 'Search docs...',
  maxResults = 5,
  showKeywords = true,
  compact = false,
}) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef(null)

  // Get current location to determine which docs we're in
  const location = useLocation()

  // Get all docs data from Docusaurus
  const allDocsData = useAllDocsData()

  // Determine current docs context and get the right docs
  const getCurrentDocsContext = () => {
    const path = location.pathname

    if (path.startsWith('/docs-enhanced')) {
      return {
        context: 'docs-enhanced',
        docs: allDocsData?.['docs-enhanced']?.versions?.[0]?.docs || {},
        label: 'Enhanced Docs',
      }
    } else if (path.startsWith('/docs-original')) {
      return {
        context: 'docs-original',
        docs: allDocsData?.['docs-original']?.versions?.[0]?.docs || {},
        label: 'Original Docs',
      }
    } else {
      // Fallback to default docs if available
      return {
        context: 'default',
        docs: allDocsData?.default?.versions?.[0]?.docs || {},
        label: 'Docs',
      }
    }
  }

  const { context, docs, label } = getCurrentDocsContext()

  // 🚨 DEBUG: Log what we're getting from Docusaurus
  useEffect(() => {
    console.log('🔍 CURRENT LOCATION:', location.pathname)
    console.log('🔍 CURRENT CONTEXT:', context)
    console.log('🔍 RAW ALL DOCS DATA:', allDocsData)
    console.log('🔍 FILTERED DOCS OBJECT:', docs)
    console.log('🔍 DOCS KEYS:', Object.keys(docs))
    console.log('🔍 TOTAL DOCS COUNT:', Object.keys(docs).length)

    if (Object.keys(docs).length > 0) {
      console.log('🔍 FIRST DOC SAMPLE:', Object.values(docs)[0])

      // Check for docs in /sample-docs/ subdirectory specifically
      const sampleDocs = Object.values(docs).filter(
        doc =>
          doc.source?.includes('sample-docs/') ||
          doc.id?.includes('sample-docs/') ||
          doc.permalink?.includes('sample-docs'),
      )
      console.log(`📁 SAMPLE-DOCS FOUND IN ${context}:`, sampleDocs.length)
      console.log(
        '📁 SAMPLE-DOCS LIST:',
        sampleDocs.map(d => ({
          title: d.title,
          id: d.id,
          source: d.source,
          permalink: d.permalink,
        })),
      )

      // Show all doc sources to verify directory structure
      console.log('📋 ALL DOC SOURCES IN CURRENT CONTEXT:')
      Object.values(docs).forEach(doc => {
        console.log(
          `  - ${doc.title}: ${doc.source || 'No source'} (${doc.id})`,
        )
      })

      // Look for auth tokens doc specifically in current context
      const authDoc = Object.values(docs).find(
        doc =>
          doc.title?.toLowerCase().includes('authentication') ||
          doc.title?.toLowerCase().includes('token') ||
          doc.id?.includes('auth-tokens') ||
          doc.source?.includes('auth-tokens'),
      )
      console.log(`🔍 AUTH TOKENS DOC FOUND IN ${context}:`, authDoc)

      if (authDoc) {
        console.log('🔍 AUTH DOC FRONT MATTER:', authDoc.frontMatter)
        console.log('🔍 AUTH DOC KEYWORDS:', authDoc.frontMatter?.keywords)
        console.log('🔍 AUTH DOC TAGS:', authDoc.frontMatter?.tags)
      } else {
        console.log(`❌ AUTH TOKENS DOC NOT FOUND IN ${context}`)
        console.log(
          '📋 Available doc titles in current context:',
          Object.values(docs).map(d => d.title),
        )
      }
    }
  }, [allDocsData, docs, context, location.pathname])

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

  const performSearch = searchQuery => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setIsOpen(false)
      return
    }

    setIsSearching(true)
    setIsOpen(true)

    // Small delay to show loading state
    setTimeout(() => {
      const q = searchQuery.toLowerCase()
      const results = []

      // Search through docs in current context only
      Object.values(docs).forEach(doc => {
        const titleMatch = doc.title?.toLowerCase().includes(q)
        const contentMatch = doc.content?.toLowerCase().includes(q)
        const descriptionMatch = doc.description?.toLowerCase().includes(q)

        // Search in front matter
        const frontMatter = doc.frontMatter || {}
        const keywordMatch = frontMatter.keywords?.some(k =>
          k.toLowerCase().includes(q),
        )
        const tagMatch = frontMatter.tags?.some(t =>
          t.toLowerCase().includes(q),
        )

        if (
          titleMatch ||
          contentMatch ||
          descriptionMatch ||
          keywordMatch ||
          tagMatch
        ) {
          const relevanceScore = calculateRelevance(doc, q)
          results.push({
            ...doc,
            relevanceScore,
            excerpt: createExcerpt(doc.content, q),
            matchedKeywords: getMatchedKeywords(frontMatter, q),
            matchedTags: getMatchedTags(frontMatter, q),
          })
        }
      })

      // Sort by relevance and limit results
      const sortedResults = results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, maxResults)

      setSearchResults(sortedResults)
      setIsSearching(false)
    }, 200)
  }

  const calculateRelevance = (doc, query) => {
    let score = 0
    const q = query.toLowerCase()
    const frontMatter = doc.frontMatter || {}

    // Enhanced docs get RAG score boost (key differentiator!)
    if (context === 'docs-enhanced' && frontMatter.ragScore) {
      score += frontMatter.ragScore * 10 // RAG score multiplier
    }

    // Title matches are most important
    if (doc.title?.toLowerCase().includes(q)) score += 50

    // Enhanced keyword matches (more keywords = better search in enhanced docs)
    const keywordBonus = context === 'docs-enhanced' ? 40 : 30
    if (frontMatter.keywords?.some(k => k.toLowerCase().includes(q)))
      score += keywordBonus

    // Enhanced docs have related_docs that can boost relevance
    if (context === 'docs-enhanced' && frontMatter.related_docs) {
      const relatedMatch = frontMatter.related_docs.some(related =>
        related.toLowerCase().includes(q),
      )
      if (relatedMatch) score += 25
    }

    // Tag matches are important
    if (frontMatter.tags?.some(t => t.toLowerCase().includes(q))) score += 20

    // Description matches
    if (doc.description?.toLowerCase().includes(q)) score += 15

    // Content matches are least important
    if (doc.content?.toLowerCase().includes(q)) score += 10

    // Cross-reference bonus for enhanced docs
    if (context === 'docs-enhanced' && frontMatter.cross_references) {
      const crossRefMatch = frontMatter.cross_references.some(ref =>
        ref.toLowerCase().includes(q),
      )
      if (crossRefMatch) score += 15
    }

    return score
  }

  const createExcerpt = (content, query) => {
    if (!content) return 'No content available'

    const q = query.toLowerCase()
    const lowerContent = content.toLowerCase()
    const index = lowerContent.indexOf(q)

    if (index === -1) {
      // If no match in content, return first 150 characters
      return content.substring(0, 150) + (content.length > 150 ? '...' : '')
    }

    // Return context around the match
    const start = Math.max(0, index - 50)
    const end = Math.min(content.length, index + 100)
    const excerpt = content.substring(start, end)

    return (
      (start > 0 ? '...' : '') + excerpt + (end < content.length ? '...' : '')
    )
  }

  const getMatchedKeywords = (frontMatter, query) => {
    if (!frontMatter.keywords) return []
    const q = query.toLowerCase()
    return frontMatter.keywords.filter(k => k.toLowerCase().includes(q))
  }

  const getMatchedTags = (frontMatter, query) => {
    if (!frontMatter.tags) return []
    const q = query.toLowerCase()
    return frontMatter.tags.filter(t => t.toLowerCase().includes(q))
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
    // Navigate to the result
    window.location.href = result.permalink
  }

  // Update placeholder to show current context
  const contextualPlaceholder = placeholder.replace('docs', label.toLowerCase())

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

  return (
    <div ref={searchRef} style={widgetStyles.container}>
      <div style={widgetStyles.contextBadge}>
        {context === 'docs-enhanced' ? 'Enhanced' : 'Original'}
      </div>
      <input
        type='text'
        placeholder={contextualPlaceholder}
        value={query}
        onChange={handleSearch}
        onFocus={() => query && setIsOpen(true)}
        style={{
          ...widgetStyles.searchInput,
          ...(isOpen ? widgetStyles.searchInputFocused : {}),
        }}
      />

      {isOpen && (
        <div style={widgetStyles.dropdown}>
          {/* Performance indicator */}
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
              {context === 'docs-enhanced'
                ? '🚀 AI-Enhanced Search Active'
                : '⚠️ Basic Keyword Search Only'}
            </div>
          )}

          {isSearching ? (
            <div style={widgetStyles.loading}>
              Searching {label.toLowerCase()}...
            </div>
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
                      {/* Enhanced docs show RAG score prominently */}
                      {context === 'docs-enhanced' &&
                        result.frontMatter?.ragScore && (
                          <span
                            style={{
                              backgroundColor: '#28a745',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                            }}
                          >
                            RAG Score: {result.frontMatter.ragScore}
                          </span>
                        )}

                      {result.frontMatter?.keywords && (
                        <span>
                          <strong>Keywords:</strong>{' '}
                          {result.frontMatter.keywords.slice(0, 3).join(', ')}
                          {result.frontMatter.keywords.length > 3 &&
                            ` (+${
                              result.frontMatter.keywords.length - 3
                            } more)`}
                        </span>
                      )}

                      {result.frontMatter?.tags && (
                        <span>
                          <strong>Tags:</strong>{' '}
                          {result.frontMatter.tags.join(', ')}
                        </span>
                      )}

                      {/* Show related docs for enhanced version */}
                      {context === 'docs-enhanced' &&
                        result.frontMatter?.related_docs && (
                          <span style={{ color: '#28a745' }}>
                            <strong>Related:</strong>{' '}
                            {result.frontMatter.related_docs.length} docs
                          </span>
                        )}

                      {/* Show cross-references for enhanced version */}
                      {context === 'docs-enhanced' &&
                        result.frontMatter?.cross_references && (
                          <span style={{ color: '#17a2b8' }}>
                            <strong>Cross-refs:</strong>{' '}
                            {result.frontMatter.cross_references.length}
                          </span>
                        )}

                      <span
                        style={{
                          marginLeft: 'auto',
                          color:
                            context === 'docs-enhanced' ? '#28a745' : '#007acc',
                          fontWeight:
                            context === 'docs-enhanced' ? 'bold' : 'normal',
                        }}
                      >
                        Score: {result.relevanceScore}
                      </span>
                    </div>
                  )}

                  {/* Enhanced docs show improvement hints */}
                  {context === 'docs-enhanced' &&
                    result.frontMatter?.enhancement_summary && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '6px 8px',
                          backgroundColor: '#e8f5e8',
                          borderLeft: '3px solid #28a745',
                          fontSize: '12px',
                          color: '#155724',
                        }}
                      >
                        <strong>✨ Enhanced:</strong>{' '}
                        {result.frontMatter.enhancement_summary}
                      </div>
                    )}
                </div>
              ))}

              {/* Search analytics for enhanced docs */}
              {context === 'docs-enhanced' && searchResults.length > 0 && (
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
                    🎯 Search Enhancement Stats:
                  </div>
                  <div
                    style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
                  >
                    <span>Results: {searchResults.length}</span>
                    <span>
                      Avg Score:{' '}
                      {Math.round(
                        searchResults.reduce(
                          (sum, r) => sum + r.relevanceScore,
                          0,
                        ) / searchResults.length,
                      )}
                    </span>
                    <span>
                      RAG Enhanced:{' '}
                      {
                        searchResults.filter(r => r.frontMatter?.ragScore)
                          .length
                      }
                    </span>
                    <span>
                      With Related:{' '}
                      {
                        searchResults.filter(r => r.frontMatter?.related_docs)
                          .length
                      }
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : query ? (
            <div style={widgetStyles.noResults}>
              <strong>
                No results found for "{query}" in {label.toLowerCase()}
              </strong>
              <br />
              {context === 'docs-enhanced' ? (
                <div style={{ marginTop: '8px' }}>
                  <small style={{ color: '#28a745', fontSize: '12px' }}>
                    ✨ Enhanced docs provide better search with:
                  </small>
                  <ul
                    style={{
                      textAlign: 'left',
                      fontSize: '11px',
                      color: '#666',
                      margin: '4px 0',
                      paddingLeft: '20px',
                    }}
                  >
                    <li>AI-extracted keywords</li>
                    <li>Related document connections</li>
                    <li>Cross-reference mapping</li>
                    <li>RAG optimization scores</li>
                  </ul>
                </div>
              ) : (
                <div style={{ marginTop: '8px' }}>
                  <small style={{ color: '#dc3545', fontSize: '12px' }}>
                    💡 Limited search capabilities in original docs
                  </small>
                  <br />
                  <small style={{ color: '#999', fontSize: '11px' }}>
                    Try the enhanced docs for AI-powered search improvements!
                  </small>
                </div>
              )}

              {/* Show search suggestions for enhanced docs */}
              {context === 'docs-enhanced' && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '8px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    textAlign: 'left',
                  }}
                >
                  <small style={{ fontWeight: 'bold', color: '#495057' }}>
                    💡 Try searching for:
                  </small>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#6c757d',
                      marginTop: '4px',
                    }}
                  >
                    "authentication", "tokens", "api", "configuration",
                    "troubleshooting"
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SearchWidget
