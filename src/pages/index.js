import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import SearchWidget from '@site/src/components/Search/SearchWidget'

import Heading from '@theme/Heading'
import styles from './index.module.css'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className='container'>
        <Heading as='h1' className='hero__title'>
          {siteConfig.title}
        </Heading>
        <p className='hero__subtitle'>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className='button button--secondary button--lg'
            to='/docs-enhanced/intro'
          >
            ✨ Try Enhanced Docs
          </Link>
          <Link
            className='button button--outline button--secondary button--lg'
            to='/docs-original/intro'
            style={{ marginLeft: '1rem' }}
          >
            📚 View Original Docs
          </Link>
        </div>
      </div>
    </header>
  )
}

function SearchComparison() {
  return (
    <section
      style={{
        padding: '4rem 0',
        backgroundColor: 'var(--ifm-color-emphasis-100)',
      }}
    >
      <div className='container'>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Heading
            as='h2'
            style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              color: 'var(--ifm-color-primary)',
            }}
          >
            🔍 Experience the Difference
          </Heading>
          <p
            style={{
              fontSize: '1.2rem',
              color: 'var(--ifm-color-emphasis-700)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}
          >
            See how AI enhancement transforms documentation search from basic
            keyword matching to intelligent, context-aware discovery.
          </p>
        </div>

        {/* Search Comparison Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* Original Search */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              border: '1px solid var(--ifm-color-emphasis-200)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            >
              Before AI
            </div>

            <div
              style={{
                textAlign: 'center',
                marginBottom: '1.5rem',
                marginTop: '1rem',
              }}
            >
              <Heading
                as='h3'
                style={{
                  fontSize: '1.4rem',
                  color: '#495057',
                  marginBottom: '0.5rem',
                }}
              >
                📚 Original Documentation
              </Heading>
              <p
                style={{
                  color: '#6c757d',
                  fontSize: '0.95rem',
                  margin: '0',
                }}
              >
                Basic keyword search with limited context
              </p>
            </div>

            <SearchWidget
              forceContext='docs-original'
              placeholder='Search original docs...'
              maxResults={3}
              showKeywords={true}
              compact={false}
            />

            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#495057',
              }}
            >
              <strong>Limitations:</strong>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem' }}>
                <li>Exact keyword matching only</li>
                <li>No context understanding</li>
                <li>Limited discoverability</li>
                <li>Basic relevance scoring</li>
              </ul>
            </div>
          </div>

          {/* Enhanced Search */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(40, 167, 69, 0.15)',
              border: '2px solid #28a745',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#28a745',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            >
              After AI
            </div>

            <div
              style={{
                textAlign: 'center',
                marginBottom: '1.5rem',
                marginTop: '1rem',
              }}
            >
              <Heading
                as='h3'
                style={{
                  fontSize: '1.4rem',
                  color: '#28a745',
                  marginBottom: '0.5rem',
                }}
              >
                ✨ AI-Enhanced Documentation
              </Heading>
              <p
                style={{
                  color: '#28a745',
                  fontSize: '0.95rem',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                Intelligent search with AI-powered insights
              </p>
            </div>

            <SearchWidget
              forceContext='docs-enhanced'
              placeholder='Search enhanced docs...'
              maxResults={3}
              showKeywords={true}
              compact={false}
            />

            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#d4edda',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#155724',
              }}
            >
              <strong>🚀 AI Enhancements:</strong>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem' }}>
                <li>Smart keyword extraction</li>
                <li>Related document connections</li>
                <li>Cross-reference mapping</li>
                <li>RAG optimization scores</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Try It Section */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '3rem',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '800px',
            margin: '3rem auto 0',
          }}
        >
          <Heading
            as='h3'
            style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--ifm-color-primary)',
            }}
          >
            💡 Try These Search Terms
          </Heading>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '1.5rem',
            }}
          >
            {[
              'authentication',
              'api tokens',
              'troubleshooting',
              'configuration',
              'getting started',
            ].map(term => (
              <span
                key={term}
                style={{
                  backgroundColor: 'var(--ifm-color-primary-lightest)',
                  color: 'var(--ifm-color-primary)',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '1px solid var(--ifm-color-primary-light)',
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = 'var(--ifm-color-primary)'
                  e.target.style.color = 'white'
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor =
                    'var(--ifm-color-primary-lightest)'
                  e.target.style.color = 'var(--ifm-color-primary)'
                }}
              >
                "{term}"
              </span>
            ))}
          </div>
          <p
            style={{
              color: 'var(--ifm-color-emphasis-700)',
              fontSize: '0.95rem',
              margin: '0',
            }}
          >
            Search the same terms in both widgets to see the AI enhancement in
            action!
          </p>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <Layout
      title={`${siteConfig.title} - AI-Enhanced Documentation`}
      description='Experience the power of AI-enhanced documentation search with our RAG plugin for Docusaurus'
    >
      <HomepageHeader />
      <SearchComparison />
    </Layout>
  )
}
