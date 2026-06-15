import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
          <div className="card shadow" style={{ maxWidth: 600 }}>
            <div className="card-body p-4">
              <h5 className="text-danger">Something went wrong</h5>
              <p className="text-muted">{this.state.error?.message}</p>
              <details className="mt-3">
                <summary className="text-muted small">Stack trace</summary>
                <pre className="small mt-2 bg-dark text-white p-3 rounded" style={{ maxHeight: 300, overflow: 'auto' }}>
                  {this.state.error?.stack}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
              <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
