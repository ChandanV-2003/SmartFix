import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    margin: '2rem',
                    border: '1px solid #ef4444',
                    borderRadius: '12px',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    textAlign: 'center'
                }}>
                    <h2 style={{ marginBottom: '1rem' }}>Something went wrong.</h2>
                    <p style={{ marginBottom: '1.5rem' }}>{this.state.error?.message || "An unexpected error occurred while rendering this page."}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.6rem 1.2rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Try Refreshing the Page
                    </button>
                    <div style={{ marginTop: '1.5rem', textAlign: 'left', fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '8px', overflowX: 'auto' }}>
                        <details>
                          <summary>View Technical Details</summary>
                          <pre>{this.state.error?.stack}</pre>
                        </details>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
