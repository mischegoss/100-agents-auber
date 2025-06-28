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
    <header
      className={clsx('hero', styles.heroBanner)}
      style={{
        background: 'linear-gradient(135deg, #2980b9 0%, #3498db 100%)',
        color: 'white',
      }}
    >
      <div className='container'>
        <Heading as='h1' className='hero__title' style={{ color: 'white' }}>
          Ragsaurus for Docusaurus
        </Heading>
        <p className='hero__subtitle' style={{ color: '#ecf0f1' }}>
          Transform legacy documentation into intelligent, RAG-ready knowledge
          systems
        </p>
        <div className={styles.buttons}>
          <Link
            className='button button--lg'
            to='/demo'
            style={{
              backgroundColor: '#e67e22',
              color: 'white',
              border: 'none',
              fontWeight: '600',
              fontSize: '1.1rem',
              padding: '1rem 2rem',
            }}
          >
            🎬 Watch Agents in Action
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
            🚀 Autonomous Documentation Intelligence
          </Heading>
          <p
            style={{
              fontSize: '1.2rem',
              color: '#2c3e50',
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: '1.6',
              fontWeight: '500',
            }}
          >
            Ragsaurus automatically optimizes your documentation with AI agents
            - reducing support costs by 40% while solving real business
            challenges.
          </p>
        </div>

        {/* Interactive Try It Section */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Heading
            as='h2'
            style={{
              fontSize: '2rem',
              marginBottom: '0.5rem',
              color: '#1a1a1a',
              fontWeight: '700',
            }}
          >
            ✨ Try It to See the Difference!
          </Heading>
          <p
            style={{
              fontSize: '1.1rem',
              color: '#2c3e50',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.5',
              fontWeight: '500',
            }}
          >
            These are live, interactive search widgets. Try the same search in
            both to experience the intelligence gap.
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

            <SearchWidget mode='original' title='Basic Search' compact={true} />

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
              <ul
                style={{
                  margin: '0.5rem 0 0 0',
                  paddingLeft: '1.2rem',
                  color: '#2c3e50',
                }}
              >
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
              Ragsaurus Enhanced
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
                🦕 RAG-Optimized Documentation
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
              mode='enhanced'
              title='Ragsaurus Enhanced Search'
              compact={true}
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
              <ul
                style={{
                  margin: '0.5rem 0 0 0',
                  paddingLeft: '1.2rem',
                  color: '#1a1a1a',
                }}
              >
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
              marginBottom: '1.5rem',
              color: '#1a1a1a',
              fontWeight: '700',
            }}
          >
            💡 Real Multi-Agent Transformation Results
          </Heading>

          {/* RAG Score Improvement */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2rem',
              marginBottom: '2rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#e67e22',
                  lineHeight: '1',
                }}
              >
                30/100
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: '#7f8c8d',
                  marginTop: '0.5rem',
                }}
              >
                Legacy Docs
              </div>
            </div>

            <div
              style={{
                fontSize: '2rem',
                color: '#2980b9',
                fontWeight: 'bold',
              }}
            >
              →
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#2980b9',
                  lineHeight: '1',
                }}
              >
                81/100
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: '#2980b9',
                  marginTop: '0.5rem',
                  fontWeight: '600',
                }}
              >
                Ragsaurus Enhanced
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#e8f5e8',
                color: '#27ae60',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                border: '2px solid #27ae60',
              }}
            >
              +170% Improvement
            </div>
          </div>

          {/* Multi-Agent Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#2980b9',
                }}
              >
                361
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                Total Improvements
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#2980b9',
                }}
              >
                4
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                AI Agents
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#2980b9',
                }}
              >
                56
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                Agent Collaborations
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#27ae60',
                }}
              >
                100%
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                Success Rate
              </div>
            </div>
          </div>

          <p
            style={{
              color: '#2c3e50',
              fontSize: '0.95rem',
              margin: '0',
              fontWeight: '500',
            }}
          >
            Try identical searches in both widgets above to experience how
            Ragsaurus transforms documentation intelligence.
          </p>
        </div>

        {/* GitHub Repository Section */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '3rem',
            padding: '2rem',
            backgroundColor: '#2c3e50',
            borderRadius: '12px',
            maxWidth: '600px',
            margin: '3rem auto 0',
            color: 'white',
          }}
        >
          <Heading
            as='h3'
            style={{
              fontSize: '1.3rem',
              marginBottom: '1rem',
              color: '#ffffff',
              fontWeight: '700',
            }}
          >
            🦕 Ready to Transform Your Docs?
          </Heading>
          <Link
            href='https://github.com/mischegoss/ragsaurus'
            style={{
              display: 'inline-block',
              backgroundColor: '#e67e22',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.2s',
              border: 'none',
            }}
            onMouseEnter={e => {
              e.target.style.backgroundColor = '#d35400'
              e.target.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = '#e67e22'
              e.target.style.transform = 'translateY(0)'
            }}
          >
            🚀 View on GitHub
          </Link>
          <p
            style={{
              color: '#bdc3c7',
              fontSize: '0.9rem',
              margin: '1rem 0 0 0',
            }}
          >
            Join developers who've eliminated support ticket chaos with
            intelligent documentation.
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
      title='Ragsaurus - AI Documentation Intelligence for Docusaurus'
      description='Transform your Docusaurus documentation with Ragsaurus. Reduce support costs, improve user experience, and boost productivity with intelligent AI-powered documentation optimization.'
    >
      <HomepageHeader />
      <SearchComparison />
    </Layout>
  )
}
