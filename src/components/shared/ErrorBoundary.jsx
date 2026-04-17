import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('CasaCare Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#F7FFFE', padding: '20px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              fontSize: '22px', fontWeight: '800', color: '#1a2b4a', marginBottom: '10px'
            }}>Something went wrong</h2>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
              We hit an unexpected error. Our team has been notified.
              Please refresh the page to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 28px', background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
                color: 'white', border: 'none', borderRadius: '10px',
                fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans',sans-serif"
              }}>
              Refresh Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
