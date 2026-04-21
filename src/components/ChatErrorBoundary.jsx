import { Component } from 'react'

const boxStyle = {
  minHeight: '60vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 20px',
  textAlign: 'center',
  fontFamily: 'system-ui, sans-serif',
  color: '#e8e6e3',
  background: '#0e0e0a',
}

const titleStyle = {
  fontSize: '1.1rem',
  fontWeight: 600,
  marginBottom: 12,
  maxWidth: 320,
}

const textStyle = {
  fontSize: '0.95rem',
  lineHeight: 1.5,
  opacity: 0.85,
  marginBottom: 24,
  maxWidth: 340,
}

const btnStyle = {
  padding: '12px 24px',
  fontSize: '1rem',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  background: '#c8a040',
  color: '#0e0e0a',
  fontWeight: 600,
}

export default class ChatErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('Chat route error', error, info)
  }

  render() {
    if (this.state.hasError) {
      const msg = String(this.state.error?.message || '')
      const chunkStale =
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed') ||
        msg.includes('error loading dynamically imported module')

      return (
        <div style={boxStyle}>
          <p style={titleStyle}>
            {chunkStale ? 'Chat could not load (outdated cache)' : 'Something went wrong loading Chat'}
          </p>
          <p style={textStyle}>
            {chunkStale
              ? 'This usually happens after an app update. Refresh the page to load the latest version. Your messages and program are safe.'
              : 'Try refreshing the page. If it keeps happening, open Home from the menu.'}
          </p>
          <button type="button" style={btnStyle} onClick={() => window.location.reload()}>
            Refresh page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
