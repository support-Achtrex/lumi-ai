import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Module Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 40,
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            maxWidth: 540,
            width: '100%',
            background: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E2E8F0',
            padding: 32,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', margin: '0 0 8px 0' }}>
              Admin Module Render Notice
            </h2>

            <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: '0 0 18px 0' }}>
              The requested administration panel encountered a client rendering exception.
            </p>

            <div style={{
              background: '#F8FAFC',
              borderRadius: 8,
              padding: '10px 14px',
              border: '1px solid #E2E8F0',
              fontSize: 12,
              color: '#DC2626',
              fontFamily: 'monospace',
              marginBottom: 24,
              textAlign: 'left',
              wordBreak: 'break-word'
            }}>
              {this.state.error?.message || 'Unknown error occurred in admin component.'}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={14} /> Reload Module
              </button>

              <button
                onClick={() => window.location.href = '/chat'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#F1F5F9',
                  color: '#334155',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={14} /> Return to App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
