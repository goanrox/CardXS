import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] p-6">
          <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-xl border border-app-border text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h1 className="text-2xl font-semibold text-app-text mb-2">Something went wrong</h1>
            <p className="text-app-text-secondary mb-8 leading-relaxed">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-app-primary text-white font-medium py-4 rounded-full hover:bg-[#0062C3] transition-all shadow-md"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-8 p-4 bg-black/5 rounded-xl text-left text-[10px] overflow-auto max-h-40 font-mono text-red-600">
                {error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}
