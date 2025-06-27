import React from 'react'
import OriginalLayout from '@theme-original/Layout'
import SearchWidget from '../../components/Search/SearchWidget.js'
import { useLocation } from '@docusaurus/router'

export default function Layout(props) {
  const location = useLocation()
  const isHomepage = location.pathname === '/'

  return (
    <OriginalLayout {...props}>
      {/* Only show search widget if NOT on homepage */}
      {!isHomepage && (
        <div
          style={{
            backgroundColor: 'var(--ifm-hero-background-color, #2e8555)',
            borderBottom: '1px solid var(--ifm-color-emphasis-200)',
            padding: '1rem 0',
            position: 'sticky',
            top: 'var(--ifm-navbar-height)',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            className='container'
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: '0 1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  color: 'white',
                }}
              >
                🔍 AI-Enhanced Documentation Search
              </span>
              <span
                style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontWeight: '600',
                }}
              >
                DEMO
              </span>
            </div>

            <SearchWidget
              placeholder="🚀 Try: 'authentication timeout' (before AI) vs 'auth session expiry' (after AI)"
              maxResults={3}
              showKeywords={true}
              compact={false}
            />

            <div
              style={{
                marginTop: '0.75rem',
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                fontWeight: '500',
              }}
            >
              💡 <strong>Before AI:</strong> Limited keyword matching •{' '}
              <strong>After AI:</strong> Smart synonym detection & enhanced
              relevance
            </div>
          </div>
        </div>
      )}

      {/* Original page content */}
      {props.children}
    </OriginalLayout>
  )
}
