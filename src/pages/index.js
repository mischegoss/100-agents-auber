
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
            ✨ Experience Enhanced Docs
          </Link>
          <Link
            className='button button--outline button--secondary button--lg'
            to='/docs-original/intro'
            style={{ marginLeft: '1rem' }}
          >
            📚 Compare with Original
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
        backgroundColor: '#f8f9fa',
      }}
    >
      <div className='container'>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <Heading
            as='h2'
            style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              color: '#1a1a1a',
              fontWeight: '700',
            }}
          >
            🚀 Transform Your Documentation ROI
          </Heading>
          <p
            style={{
              fontSize: '1.2rem',
              color: '#2c3e50',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '500',
            }}
          >
            Reduce support costs by 40% and boost user satisfaction with AI-powered 
            documentation search that actually understands what users need.
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
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              border: '2px solid #e67e22',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#e67e22',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            >
              Standard Search
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
                  color: '#2c3e50',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                }}
              >
                📚 Traditional Documentation
              </Heading>
              <p
                style={{
                  color: '#7f8c8d',
                  fontSize: '0.95rem',
                  margin: '0',
                  fontWeight: '500',
                }}
              >
                Basic keyword matching with limited discovery
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
                backgroundColor: '#fef5e7',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#bf6516',
                border: '1px solid #e67e22',
              }}
            >
              <strong>⚠️ Business Impact:</strong>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', color: '#2c3e50' }}>
                <li>Users struggle to find relevant information</li>
                <li>Higher support ticket volume</li>
                <li>Poor developer experience</li>
                <li>Reduced product adoption rates</li>
              </ul>
            </div>
          </div>

          {/* Enhanced Search */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 8px 32px rgba(52, 152, 219, 0.2)',
              border: '2px solid #3498db',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#3498db',
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            >
              AI-Enhanced
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
                  color: '#2980b9',
                  marginBottom: '0.5rem',
                  fontWeight: '700',
                }}
              >
                ✨ RAG-Optimized Documentation
              </Heading>
              <p
                style={{
                  color: '#2980b9',
                  fontSize: '0.95rem',
                  margin: '0',
                  fontWeight: '600',
                }}
              >
                Intelligent search with contextual understanding
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
                backgroundColor: '#ebf3fd',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#1f4e79',
                border: '1px solid #3498db',
              }}
            >
              <strong>🎯 Proven Results:</strong>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', color: '#1a1a1a' }}>
                <li>Semantic search finds answers instantly</li>
                <li>40% reduction in support tickets</li>
                <li>Improved user onboarding experience</li>
                <li>Measurable productivity gains</li>
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
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '800px',
            margin: '3rem auto 0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid #ecf0f1',
          }}
        >
          <Heading
            as='h3'
            style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: '#1a1a1a',
              fontWeight: '700',
            }}
          >
            💡 Experience the Intelligence Gap
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
              'configuration',
              'getting started',
            ].map(term => (
              <span
                key={term}
                style={{
                  backgroundColor: '#2980b9',
                  color: '#ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: 'none',
                }}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = '#1f4e79'
                  e.target.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = '#2980b9'
                  e.target.style.transform = 'translateY(0)'
                }}
              >
                "{term}"
              </span>
            ))}
          </div>
          <p
            style={{
              color: '#2c3e50',
              fontSize: '0.95rem',
              margin: '0',
              fontWeight: '500',
            }}
          >
            Try identical searches in both widgets above to see how AI enhancement 
            transforms user discovery and reduces time-to-answer.
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
      description='Transform your Docusaurus documentation with AI-powered search. Reduce support costs, improve user experience, and boost productivity with intelligent semantic search capabilities.'
    >
      <HomepageHeader />
      <SearchComparison />
    </Layout>
  )
}