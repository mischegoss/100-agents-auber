import React, { useState, useRef, useEffect } from 'react'
import { useAllDocsData } from '@docusaurus/plugin-content-docs/client'

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

  // Get all docs data from Docusaurus
  const allDocsData = useAllDocsData()
  const docs = allDocsData?.default?.versions?.[0]?.docs || {}

  // 🚨 DEBUG: Log what we're getting from Docusaurus
  useEffect(() => {
    console.log('🔍 RAW ALL DOCS DATA:', allDocsData)
    console.log('🔍 PARSED DOCS OBJECT:', docs)
    console.log('🔍 DOCS KEYS:', Object.keys(docs))
    console.log('🔍 TOTAL DOCS COUNT:', Object.keys(docs).length)

    if (Object.keys(docs).length > 0) {
      console.log('🔍 FIRST DOC SAMPLE:', Object.values(docs)[0])

      // Look for auth tokens doc specifically
      const authDoc = Object.values(docs).find(
        doc =>
          doc.title?.toLowerCase().includes('authentication') ||
          doc.title?.toLowerCase().includes('token') ||
          doc.id?.includes('auth-tokens') ||
          doc.source?.includes('auth-tokens'),
      )
      console.log('🔍 AUTH TOKENS DOC FOUND:', authDoc)

      if (authDoc) {
        console.log('🔍 AUTH DOC FRONT MATTER:', authDoc.frontMatter)
        console.log('🔍 AUTH DOC KEYWORDS:', authDoc.frontMatter?.keywords)
        console.log('🔍 AUTH DOC TAGS:', authDoc.frontMatter?.tags)
      } else {
        console.log('❌ AUTH TOKENS DOC NOT FOUND')
        console.log(
          '📋 Available doc titles:',
          Object.values(docs).map(d => d.title),
        )
      }
    }
  }, [allDocsData, docs])

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

      // Search through all docs
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

    // Title matches are most important
    if (doc.title?.toLowerCase().includes(q)) score += 50

    // Keyword matches are very important
    if (frontMatter.keywords?.some(k => k.toLowerCase().includes(q)))
      score += 30

    // Tag matches are important
    if (frontMatter.tags?.some(t => t.toLowerCase().includes(q))) score += 20

    // Description matches
    if (doc.description?.toLowerCase().includes(q)) score += 15

    // Content matches are least important
    if (doc.content?.toLowerCase().includes(q)) score += 10

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
      borderColor: '#007acc',
      boxShadow: '0 0 0 3px rgba(0, 122, 204, 0.1)',
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
    result: {
      padding: compact ? '12px' : '16px',
      borderBottom: '1px solid #f0f0f0',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    resultTitle: {
      fontSize: compact ? '14px' : '16px',
      fontWeight: '600',
      color: '#007acc',
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
      <input
        type='text'
        placeholder={placeholder}
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
          {isSearching ? (
            <div style={widgetStyles.loading}>Searching...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((result, index) => (
              <div
                key={result.id}
                style={widgetStyles.result}
                onClick={() => handleResultClick(result)}
                onMouseEnter={e => (e.target.style.backgroundColor = '#f8f9fa')}
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
                    {result.frontMatter?.keywords && (
                      <span>
                        <strong>Keywords:</strong>{' '}
                        {result.frontMatter.keywords.join(', ')}
                      </span>
                    )}
                    {result.frontMatter?.tags && (
                      <span>
                        <strong>Tags:</strong>{' '}
                        {result.frontMatter.tags.join(', ')}
                      </span>
                    )}
                    <span style={{ marginLeft: 'auto', color: '#007acc' }}>
                      Score: {result.relevanceScore}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : query ? (
            <div style={widgetStyles.noResults}>
              <strong>No results found for "{query}"</strong>
              <br />
              <small style={{ color: '#999', fontSize: '12px' }}>
                💡 This will improve after AI enhancement!
              </small>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SearchWidget
