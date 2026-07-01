// src/components/common/ErrorBoundary/ErrorBoundary.jsx
// Class component — required because error boundaries must be class-based in React.
// Catches any render error in the subtree and shows a fallback UI
// instead of a blank white screen.

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Render error caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '40vh', padding: '2rem',
          gap: '1rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif',
        }}>
          <p style={{ fontSize: '0.875rem', color: '#5C5C5C' }}>
            Something went wrong loading this page.
          </p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              padding: '0.5rem 1.5rem', background: '#7B5C2E', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.1em',
            }}
          >
            RELOAD PAGE
          </button>
          {this.state.error && (
            <pre style={{
              marginTop: '1rem', padding: '1rem', background: '#fff0f0',
              border: '1px solid #fcc', fontSize: '0.7rem', textAlign: 'left',
              maxWidth: '600px', overflow: 'auto', whiteSpace: 'pre-wrap', color: '#c62828',
            }}>
              {this.state.error.message}{'\n\n'}{this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
