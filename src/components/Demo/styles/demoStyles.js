// src/styles/demoStyles.js
// All demo styles as JavaScript objects for import

export const demoStyles = {
  // Color palette
  colors: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    accent: '#e67e22', // Orange accent
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
  },

  // Main container
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    color: '#1e293b',
    display: 'flex',
    flexDirection: 'column',
  },

  // Header
  header: {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    color: 'white',
    padding: '1.5rem 2rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },

  headerTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    margin: 0,
  },

  headerSubtitle: {
    fontSize: '1rem',
    opacity: 0.9,
    marginBottom: '1.5rem',
    margin: '0 0 1.5rem 0',
  },

  startButton: {
    background: '#22c55e',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    fontFamily: 'inherit',
  },

  restartButton: {
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    fontFamily: 'inherit',
    marginLeft: '0.5rem',
  },

  // Main layout
  mainLayout: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 300px 280px',
    gap: '1rem',
    padding: '1rem',
    maxWidth: '1600px',
    margin: '0 auto',
    width: '100%',
  },

  // Document panel
  documentPanel: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },

  documentHeader: {
    background: '#1f2937',
    color: 'white',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  filename: {
    fontFamily: 'JetBrains Mono, monospace',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
  },

  documentContent: {
    flex: 1,
    padding: '1rem',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.85rem',
    lineHeight: '1.6',
    overflowY: 'auto',
    maxHeight: '70vh',
  },

  frontmatter: {
    background: '#f1f5f9',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    borderLeft: '4px solid #2563eb',
  },

  yamlKey: {
    color: '#0ea5e9',
    fontWeight: '500',
  },

  yamlValue: {
    color: '#059669',
  },

  newContent: {
    background: '#dcfce7',
    padding: '0.25rem',
    borderRadius: '3px',
    animation: 'highlight 2s ease-out',
  },

  // Console panel
  consolePanel: {
    background: '#0f172a',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },

  consoleHeader: {
    background: '#1e293b',
    color: 'white',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },

  consoleContent: {
    flex: 1,
    padding: '1rem',
    color: '#e2e8f0',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.75rem',
    lineHeight: '1.5',
    overflowY: 'auto',
    maxHeight: '70vh',
  },

  logLine: {
    marginBottom: '0.5rem',
    opacity: 0,
    animation: 'slideIn 0.3s ease-out forwards',
  },

  // Sidebar panel
  sidebarPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },

  agentsSection: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '1rem',
  },

  agentsTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '0 0 1rem 0',
  },

  agent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    background: '#f8fafc',
    borderRadius: '6px',
    opacity: 0.4,
    transition: 'all 0.3s ease',
  },

  agentActive: {
    opacity: 1,
    background: '#eff6ff',
    borderLeft: '3px solid #2563eb',
    transform: 'scale(1.02)',
  },

  agentCompleted: {
    opacity: 1,
    background: '#f0fdf4',
    borderLeft: '3px solid #22c55e',
  },

  agentAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
  },

  agentInfo: {
    flex: 1,
  },

  agentName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    margin: 0,
    marginBottom: '0.25rem',
  },

  agentStatus: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: 0,
  },

  // Metrics section
  metricsSection: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '1rem',
  },

  metricsTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    margin: '0 0 1rem 0',
  },

  ragScore: {
    textAlign: 'center',
    marginBottom: '1rem',
  },

  ragScoreValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#22c55e',
    margin: 0,
  },

  ragScoreLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: 0,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },

  metric: {
    textAlign: 'center',
  },

  metricValue: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2563eb',
    margin: 0,
  },

  metricLabel: {
    fontSize: '0.7rem',
    color: '#6b7280',
    margin: 0,
  },

  // GitHub badge
  githubBadge: {
    position: 'fixed',
    bottom: '1rem',
    right: '1rem',
    background: '#1f2937',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    opacity: 0,
    transform: 'translateY(100%)',
    transition: 'all 0.3s ease',
  },

  githubBadgeVisible: {
    opacity: 1,
    transform: 'translateY(0)',
  },

  // Human review section
  humanReview: {
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '6px',
    padding: '0.75rem',
    marginTop: '0.5rem',
  },

  humanReviewTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#92400e',
    margin: '0 0 0.5rem 0',
  },

  humanReviewContent: {
    fontSize: '0.75rem',
    color: '#78350f',
    margin: 0,
  },

  // Processing overlay
  processingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },

  processingContent: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },

  processingIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
    animation: 'spin 1s linear infinite',
  },
}
